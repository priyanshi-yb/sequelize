'use strict';

const util = require('util');
const _ = require('lodash');
const Utils = require('../../utils');
const Model = require('../../model');

const PostgresQueryGenerator = require('../postgres/query-generator');

class YugabyteQueryGenerator extends PostgresQueryGenerator{

  changeColumnQuery(tableName, attributes) {
    const query = subQuery => `ALTER TABLE ${this.quoteTable(tableName)} ALTER COLUMN ${subQuery};`;
    const sql = [];
    for (const attributeName in attributes) {
      let definition = this.dataTypeMapping(tableName, attributeName, attributes[attributeName]);
      let attrSql = '';

      if (definition.includes('NOT NULL')) {
        attrSql += query(`${this.quoteIdentifier(attributeName)} SET NOT NULL`);

        definition = definition.replace('NOT NULL', '').trim();
      } else if (!definition.includes('REFERENCES')) {
        attrSql += query(`${this.quoteIdentifier(attributeName)} DROP NOT NULL`);
      }

      if (definition.includes('DEFAULT')) {
        attrSql += query(`${this.quoteIdentifier(attributeName)} SET DEFAULT ${definition.match(/DEFAULT ([^;]+)/)[1]}`);

        definition = definition.replace(/(DEFAULT[^;]+)/, '').trim();
      } else if (!definition.includes('REFERENCES')) {
        attrSql += query(`${this.quoteIdentifier(attributeName)} DROP DEFAULT`);
      }

      if (attributes[attributeName].startsWith('ENUM(')) {
        attrSql += this.pgEnum(tableName, attributeName, attributes[attributeName]);
        definition = definition.replace(/^ENUM\(.+\)/, this.pgEnumName(tableName, attributeName, { schema: false }));
        definition += ` USING (${this.quoteIdentifier(attributeName)}::${this.pgEnumName(tableName, attributeName)})`;
      }

      if (/UNIQUE;*$/.test(definition)) {
        definition = definition.replace(/UNIQUE;*$/, '');
        attrSql += query(`ADD UNIQUE (${this.quoteIdentifier(attributeName)})`).replace('ALTER COLUMN', '');
      }

      if (definition.includes('REFERENCES')) {
        definition = definition.replace(/.+?(?=REFERENCES)/, '');
        attrSql += query(`ADD FOREIGN KEY (${this.quoteIdentifier(attributeName)}) ${definition}`).replace('ALTER COLUMN', '');
      } else {
        throw new Error(`Change column type not supported yet in yugabyte dialect.`);// ALTER TABLE ALTER COLUMN TYPE not yet supported in Yugabyte.
      }

      sql.push(attrSql);
    }

    return sql.join('');
  }

  setDeferredQuery(columns){
    throw new Error('Deferrable Constraints not yet supported well in yugabyte dialect.');
  }

  setImmediateQuery(columns){
    throw new Error('Deferrable Constraints not yet supported well in yugabyte dialect.');
  }

  addIndexQuery(tableName, attributes, options, rawTablename) {
    options = options || {};

    if (!Array.isArray(attributes)) {
      options = attributes;
      attributes = undefined;
    } else {
      options.fields = attributes;
    }

    options.prefix = options.prefix || rawTablename || tableName;
    if (options.prefix && typeof options.prefix === 'string') {
      options.prefix = options.prefix.replace(/\./g, '_');
      options.prefix = options.prefix.replace(/("|')/g, '');
    }

    const fieldsSql = options.fields.map(field => {
      if (field instanceof Utils.SequelizeMethod) {
        return this.handleSequelizeMethod(field);
      }

      if (typeof field === 'string') {
        field = {
          name: field,
        };
      }

      let result = '';

      if (field.attribute) {
        field.name = field.attribute;
      }

      if (!field.name) {
        throw new Error(`The following index field has no name: ${util.inspect(field)}`);
      }

      result += this.quoteIdentifier(field.name);

      if (this._dialect.supports.index.collate && field.collate) {
        result += ` COLLATE ${this.quoteIdentifier(field.collate)}`;
      }

      if (this._dialect.supports.index.operator) {
        const operator = field.operator || options.operator;
        if (operator) {
          result += ` ${operator}`;
        }
      }

      if (this._dialect.supports.index.length > 0 && field.length > 0) {
        result += `(${field.length})`;
      }

      if (field.order) {
        result += ` ${field.order}`;
      }

      return result;
    });

    if (!options.name) {
      // Mostly for cases where addIndex is called directly by the user without an options object (for example in migrations)
      // All calls that go through sequelize should already have a name
      options = Utils.nameIndex(options, options.prefix);
    }

    options = Model._conformIndex(options);

    if (!this._dialect.supports.index.type) {
      delete options.type;
    }

    if (options.where) {
      options.where = this.whereQuery(options.where);
    }

    if (typeof tableName === 'string') {
      tableName = this.quoteIdentifiers(tableName);
    } else {
      tableName = this.quoteTable(tableName);
    }

    const concurrently = this._dialect.supports.index.concurrently && options.concurrently ? 'CONCURRENTLY' : undefined;
    if (!this._dialect.supports.index.concurrently && options.concurrently){
      throw new Error('Adding Index Concurrently option is not yet supported in yugabyte dialect.');
    }

    let ind;
    if (this._dialect.supports.indexViaAlter) {
      ind = [
        'ALTER TABLE',
        tableName,
        concurrently,
        'ADD',
      ];
    } else {
      ind = ['CREATE'];
    }

    ind = ind.concat(
      options.unique ? 'UNIQUE' : '',
      options.type, 'INDEX',
      !this._dialect.supports.indexViaAlter ? concurrently : undefined,
      this.quoteIdentifiers(options.name),
      this._dialect.supports.index.using === 1 && options.using ? `USING ${options.using}` : '',
      !this._dialect.supports.indexViaAlter ? `ON ${tableName}` : undefined,
      this._dialect.supports.index.using === 2 && options.using ? `USING ${options.using}` : '',
      `(${fieldsSql.join(', ')})`,
      this._dialect.supports.index.parser && options.parser ? `WITH PARSER ${options.parser}` : undefined,
      this._dialect.supports.index.where && options.where ? options.where : undefined,
    );

    return _.compact(ind).join(' ');
  }
}

module.exports = YugabyteQueryGenerator;
