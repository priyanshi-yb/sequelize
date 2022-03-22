'use strict';

const chai = require('chai');

const expect = chai.expect;
const Support = require('../support');
const DataTypes = require('@sequelize/core/lib/data-types');

const current = Support.sequelize;

describe(Support.getTestDialectTeaser('Model'), () => {
  if (current.dialect.supports.GEOGRAPHY) {
    /**
     * Yugabyte has some issues with postGIS set up for now and due to which tests will fail, so need to skip them for now.
     * Can take a look for the issues related to that here - https://github.com/yugabyte/yugabyte-db/issues?q=is%3Aissue+is%3Aopen+postGIS
     */
    if (current.dialect.name === 'yugabyte') {
      return;
    }

    describe('GEOGRAPHY', () => {
      beforeEach(async function () {
        this.User = this.sequelize.define('User', {
          username: DataTypes.STRING,
          geography: DataTypes.GEOGRAPHY,
        });

        await this.User.sync({ force: true });
      });

      it('works with aliases fields', async function () {
        const Pub = this.sequelize.define('Pub', {
          location: { field: 'coordinates', type: DataTypes.GEOGRAPHY },
        });
        const point = {
          type: 'Point',
          coordinates: [39.807_222, -76.984_722],
          crs: {
            type: 'name',
            properties: {
              name: 'EPSG:4326',
            },
          },
        };

        await Pub.sync({ force: true });
        const pub = await Pub.create({ location: point });
        expect(pub).not.to.be.null;
        expect(pub.location).to.be.deep.eql(point);
      });

      it('should create a geography object', async function () {
        const User = this.User;
        const point = {
          type: 'Point',
          coordinates: [39.807_222, -76.984_722],
          crs: {
            type: 'name',
            properties: {
              name: 'EPSG:4326',
            },
          },
        };

        const newUser = await User.create({ username: 'username', geography: point });
        expect(newUser).not.to.be.null;
        expect(newUser.geography).to.be.deep.eql(point);
      });

      it('should update a geography object', async function () {
        const User = this.User;
        const point1 = {
          type: 'Point',
          coordinates: [39.807_222, -76.984_722],
          crs: {
            type: 'name',
            properties: {
              name: 'EPSG:4326',
            },
          },
        };
        const point2 = {
          type: 'Point',
          coordinates: [49.807_222, -86.984_722],
          crs: {
            type: 'name',
            properties: {
              name: 'EPSG:4326',
            },
          },
        };
        const props = { username: 'username', geography: point1 };

        await User.create(props);
        await User.update({ geography: point2 }, { where: { username: props.username } });
        const user = await User.findOne({ where: { username: props.username } });
        expect(user.geography).to.be.deep.eql(point2);
      });
    });

    describe('GEOGRAPHY(POINT)', () => {
      beforeEach(async function () {
        this.User = this.sequelize.define('User', {
          username: DataTypes.STRING,
          geography: DataTypes.GEOGRAPHY('POINT'),
        });

        await this.User.sync({ force: true });
      });

      it('should create a geography object', async function () {
        const User = this.User;
        const point = {
          type: 'Point',
          coordinates: [39.807_222, -76.984_722],
          crs: {
            type: 'name',
            properties: {
              name: 'EPSG:4326',
            },
          },
        };

        const newUser = await User.create({ username: 'username', geography: point });
        expect(newUser).not.to.be.null;
        expect(newUser.geography).to.be.deep.eql(point);
      });

      it('should update a geography object', async function () {
        const User = this.User;
        const point1 = {
          type: 'Point',
          coordinates: [39.807_222, -76.984_722],
          crs: {
            type: 'name',
            properties: {
              name: 'EPSG:4326',
            },
          },
        };
        const point2 = {
          type: 'Point',
          coordinates: [49.807_222, -86.984_722],
          crs: {
            type: 'name',
            properties: {
              name: 'EPSG:4326',
            },
          },
        };
        const props = { username: 'username', geography: point1 };

        await User.create(props);
        await User.update({ geography: point2 }, { where: { username: props.username } });
        const user = await User.findOne({ where: { username: props.username } });
        expect(user.geography).to.be.deep.eql(point2);
      });
    });

    describe('GEOGRAPHY(LINESTRING)', () => {
      beforeEach(async function () {
        this.User = this.sequelize.define('User', {
          username: DataTypes.STRING,
          geography: DataTypes.GEOGRAPHY('LINESTRING'),
        });

        await this.User.sync({ force: true });
      });

      it('should create a geography object', async function () {
        const User = this.User;
        const point = {
          type: 'LineString',
          coordinates: [[100, 0], [101, 1]],
          crs: {
            type: 'name',
            properties: {
              name: 'EPSG:4326',
            },
          },
        };

        const newUser = await User.create({ username: 'username', geography: point });
        expect(newUser).not.to.be.null;
        expect(newUser.geography).to.be.deep.eql(point);
      });

      it('should update a geography object', async function () {
        const User = this.User;
        const point1 = {
          type: 'LineString',
          coordinates: [[100, 0], [101, 1]],
          crs: {
            type: 'name',
            properties: {
              name: 'EPSG:4326',
            },
          },
        };
        const point2 = {
          type: 'LineString',
          coordinates: [[101, 0], [102, 1]],
          crs: {
            type: 'name',
            properties: {
              name: 'EPSG:4326',
            },
          },
        };
        const props = { username: 'username', geography: point1 };

        await User.create(props);
        await User.update({ geography: point2 }, { where: { username: props.username } });
        const user = await User.findOne({ where: { username: props.username } });
        expect(user.geography).to.be.deep.eql(point2);
      });
    });

    describe('GEOGRAPHY(POLYGON)', () => {
      beforeEach(async function () {
        this.User = this.sequelize.define('User', {
          username: DataTypes.STRING,
          geography: DataTypes.GEOGRAPHY('POLYGON'),
        });

        await this.User.sync({ force: true });
      });

      it('should create a geography object', async function () {
        const User = this.User;
        const point = {
          type: 'Polygon',
          coordinates: [
            [[100, 0], [101, 0], [101, 1], [100, 1], [100, 0]],
          ],
          crs: {
            type: 'name',
            properties: {
              name: 'EPSG:4326',
            },
          },
        };

        const newUser = await User.create({ username: 'username', geography: point });
        expect(newUser).not.to.be.null;
        expect(newUser.geography).to.be.deep.eql(point);
      });

      it('should update a geography object', async function () {
        const User = this.User;
        const polygon1 = {
          type: 'Polygon',
          coordinates: [
            [[100, 0], [101, 0], [101, 1], [100, 1], [100, 0]],
          ],
          crs: {
            type: 'name',
            properties: {
              name: 'EPSG:4326',
            },
          },
        };
        const polygon2 = {
          type: 'Polygon',
          coordinates: [
            [[100, 0], [102, 0], [102, 1], [100, 1], [100, 0]],
          ],
          crs: {
            type: 'name',
            properties: {
              name: 'EPSG:4326',
            },
          },
        };
        const props = { username: 'username', geography: polygon1 };

        await User.create(props);
        await User.update({ geography: polygon2 }, { where: { username: props.username } });
        const user = await User.findOne({ where: { username: props.username } });
        expect(user.geography).to.be.deep.eql(polygon2);
      });
    });

    if (current.dialect.name === 'postgres') {
      describe('GEOGRAPHY(POLYGON, SRID)', () => {
        beforeEach(async function () {
          this.User = this.sequelize.define('User', {
            username: DataTypes.STRING,
            geography: DataTypes.GEOGRAPHY('POLYGON', 4326),
          });

          await this.User.sync({ force: true });
        });

        it('should create a geography object', async function () {
          const User = this.User;
          const point = {
            type: 'Polygon',
            coordinates: [
              [[100, 0], [101, 0], [101, 1], [100, 1], [100, 0]],
            ],
            crs: {
              type: 'name',
              properties: {
                name: 'EPSG:4326',
              },
            },
          };

          const newUser = await User.create({ username: 'username', geography: point });
          expect(newUser).not.to.be.null;
          expect(newUser.geography).to.be.deep.eql(point);
        });

        it('should update a geography object', async function () {
          const User = this.User;
          const polygon1 = {
            type: 'Polygon',
            coordinates: [
              [[100, 0], [101, 0], [101, 1], [100, 1], [100, 0]],
            ],
            crs: {
              type: 'name',
              properties: {
                name: 'EPSG:4326',
              },
            },
          };
          const polygon2 = {
            type: 'Polygon',
            coordinates: [
              [[100, 0], [102, 0], [102, 1], [100, 1], [100, 0]],
            ],
            crs: {
              type: 'name',
              properties: {
                name: 'EPSG:4326',
              },
            },
          };
          const props = { username: 'username', geography: polygon1 };

          await User.create(props);
          await User.update({ geography: polygon2 }, { where: { username: props.username } });
          const user = await User.findOne({ where: { username: props.username } });
          expect(user.geography).to.be.deep.eql(polygon2);
        });
      });
    }

    describe('sql injection attacks', () => {
      beforeEach(async function () {
        this.Model = this.sequelize.define('Model', {
          location: DataTypes.GEOGRAPHY,
        });
        await this.sequelize.sync({ force: true });
      });

      it('should properly escape the single quotes', async function () {
        await this.Model.create({
          location: {
            type: 'Point',
            properties: {
              exploit: '\'); DELETE YOLO INJECTIONS; -- ',
            },
            coordinates: [39.807_222, -76.984_722],
          },
        });
      });
    });
  }
});
