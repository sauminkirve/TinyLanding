/* eslint-env mocha */

// const { Server } = require('mock-socket');
const { defaultHash } = require('./fixtures');
const { execSync, exec } = require('child_process');
const path = require('path');
const chai = require('chai');
const sinon = require('sinon');
const { describe, it } = require('mocha');
const db = require('../app/db/models');
const fs = require('fs-extra');


const { expect } = chai;
chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-fs'));


const { landingList, landingAdd, landingRemove } = require('../bin/landing');

describe('Cli Console', () => {
  const basePublic = path.join(__dirname, '../app/public');
  const baseView = path.join(__dirname, '../app/views');

  describe('Manage CLI output', () => {
    it('should show help with error when ask manage without parameters', async (done) => {
      try {
        execSync('NODE_ENV=test node ./bin/manage.js');
      } catch (error) {
        expect(error.message).to.include.any.string('You need at least one command before moving on');
        done();
      }
    });
    it('should show help without error when ask help parameters', (done) => {
      exec('NODE_ENV=test node ./bin/manage.js --help', (err, stdout, stderr) => {
        expect(err).to.be.a('null');
        expect(stderr).to.be.eq('');
        done();
      });
    });
    it('should show help with error when call wrong command', (done) => {
      exec('NODE_ENV=test node ./bin/manage.js aaa', (err, stdout, stderr) => {
        expect(err).to.be.not.a('null');
        expect(stderr).to.include.any.string('You need at least one command before moving on');
        done();
      });
    });
    it('should show landing list without error', (done) => {
      exec('NODE_ENV=test node ./bin/manage.js landing', (err, stdout, stderr) => {
        expect(err).to.be.a('null');
        expect(stderr).to.be.eq('');
        done();
      });
    });
    it('should adding landing without error', (done) => {
      const nameLanding = 'test2aaa33bb3a';
      exec(`NODE_ENV=test node ./bin/manage.js add-landing ${nameLanding}`, (err, stdout, stderr) => {
        expect(err).to.be.a('null');
        expect(stderr).to.be.eq('');
        landingRemove({ name: nameLanding }).then(() => done()).catch(err2 => done(err2));
      });
    });
    it('should remove landing without error', (done) => {
      const nameLanding = 'test2aaa33bb322';
      landingAdd({ name: nameLanding }).then((landing) => {
        exec(`NODE_ENV=test node ./bin/manage.js remove-landing --name ${landing.name}`, (err, stdout, stderr) => {
          expect(err).to.be.a('null');
          expect(stderr).to.be.eq('');
          fs.remove(path.join(basePublic, landing.slug)).then(() => {
            fs.remove(path.join(baseView, landing.slug)).then(() => done());
          });
        });
      });
    });
    it('should show leads for tinylanding without error', (done) => {
      exec('NODE_ENV=test node ./bin/manage.js leads --name tiny-landing', (err, stdout, stderr) => {
        expect(err).to.be.a('null');
        expect(stderr).to.be.eq('');
        done();
      });
    });
  });
  describe('Listing Landing Page', () => {
    it('should show list on console without hash when use command without parameters', async () => {
      const consoleTable = sinon.spy(console, 'table');
      const consoleLog = sinon.spy(console, 'log');
      await landingList({ hash: false });
      expect(consoleLog.callCount).to.equal(1);
      const tableResult = consoleTable.args[0];
      expect(tableResult).to.not.have.property('Hash');
      /* eslint-disable no-console */
      console.table.restore();
      console.log.restore();
      /* eslint-enable no-console */
    });
    it('should show list on console with hash column when use hash parameter', async () => {
      const consoleTable = sinon.spy(console, 'table');
      const consoleLog = sinon.spy(console, 'log');
      await landingList({ hash: true });
      expect(consoleLog.callCount).to.equal(1);
      const tableResult = consoleTable.args[0][0];
      expect(tableResult).all.have.property('Hash');
      /* eslint-disable no-console */
      console.table.restore();
      console.log.restore();
      /* eslint-enable no-console */
    });
  });
  describe('Landing List command', () => {
    it('given no parameters should return object when called', async () => {
      const result = await landingList();
      expect(result).to.be.a('Array');
      expect(result).all.have.property('Name');
      expect(result).all.have.property('Slug');
      expect(result).all.have.property('Created');
      expect(result).all.have.property('Leads');
      expect(result).all.not.have.property('Hash');
    });
    it('given hash false should return object when called', async () => {
      const result = await landingList();
      expect(result).to.be.a('Array');
      expect(result).all.have.property('Name');
      expect(result).all.have.property('Slug');
      expect(result).all.have.property('Created');
      expect(result).all.have.property('Leads');
      expect(result).all.not.have.property('Hash');
    });
    it('given hash true should return object when called', async () => {
      const result = await landingList({ hash: true });
      expect(result).to.be.a('Array');
      expect(result).all.have.property('Name');
      expect(result).all.have.property('Slug');
      expect(result).all.have.property('Created');
      expect(result).all.have.property('Leads');
      expect(result).all.have.property('Hash');
    });

    it('given order name should return object when called', async () => {
      const result = await landingList({ order: 'name' });
      expect(result).to.be.a('Array');
    });

    it('given order created should return object when called', async () => {
      const result = await landingList({ order: 'name' });
      expect(result).to.be.a('Array');
    });

    it('given order leads should return object when called', async () => {
      const result = await landingList({ order: 'leads' });
      expect(result).to.be.a('Array');
    });

    it('given order null should throw error when called', async (done) => {
      landingList({ order: null }).then(data => done(data)).error(done());
    });

    it('given order ee should throw error when called', async (done) => {
      landingList({ order: 'ee' }).then(data => done(data)).error(done());
    });

    it('given all parameters should return object when called', async () => {
      const result = await landingList({ hash: true, order: 'name' });
      expect(result).to.be.a('Array');
      expect(result).all.have.property('Name');
      expect(result).all.have.property('Slug');
      expect(result).all.have.property('Created');
      expect(result).all.have.property('Leads');
      expect(result).all.have.property('Hash');
    });
    it('given a lead in default landing should return greater 1 in leads columns', async () => {
      const tinyLanding = await db.LandingPage.findOne({ where: { hash: defaultHash } });
      await db.Lead.create({
        LandingPageId: tinyLanding.id,
        name: 'Pinco',
        surname: 'Pallino',
        email: 'pasalino@gmail.com',
        phone: '33333',
        message: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
        company: 'BeeInnovative',
      });
      const result = await landingList({ hash: true });
      expect(result).to.be.a('Array');
      expect(result).contain.an.item.with.property('Hash', defaultHash);
      const tinyLandingResult = result.filter(item => item.Hash === defaultHash)[0];
      expect(tinyLandingResult.Leads).to.be.gte(1);
    });
  });
  describe('Landing Add Command', () => {
    it('give no parameters should give error message required name', async () => {
      const consoleLog = sinon.spy(console, 'log');
      await landingAdd();
      expect(consoleLog.callCount).to.equal(1);
      expect(consoleLog.args[0][0]).to.include.any.string('Name is required for create new landing');
      console.log.restore();
    });
    it('give name parameter for exists landing should give error message already exists', async () => {
      const consoleLog = sinon.spy(console, 'log');
      const landingName = 'Test99999abc';
      const slugName = 'test99999abc';
      const landing = await db.LandingPage.create({ name: landingName, slug: slugName });
      await landingAdd({ name: landingName });
      await landing.destroy();
      expect(consoleLog.callCount).to.equal(1);
      expect(consoleLog.args[0][0]).to.include.any.string(`Landing page '${landingName}' already exists!`);
      console.log.restore();
    });
    it('give name and slug parameters for exists landing should give error message already exists', async () => {
      const consoleLog = sinon.spy(console, 'log');
      const landingName = 'Test99999abc';
      const slugName = 'test99999abc';
      const landing = await db.LandingPage.create({ name: landingName, slug: slugName });
      await landingAdd({ name: `${landingName}_2`, slug: slugName });
      await landing.destroy();
      expect(consoleLog.callCount).to.equal(1);
      expect(consoleLog.args[0][0]).to.include.any.string(`Slug '${slugName}' already exists!`);
      console.log.restore();
    });
    it('give name and slug parameters and exists folder should give error message already exists folder', async () => {
      const consoleLog = sinon.spy(console, 'log');
      const landingName = 'Test99999abcd';
      const slugName = 'test99999abc';
      const viewFolder = path.join(baseView, slugName);
      const publicFolder = path.join(basePublic, slugName);
      await fs.mkdir(viewFolder);
      await fs.mkdir(publicFolder);
      await landingAdd({ name: landingName, slug: slugName });
      expect(consoleLog.callCount).to.equal(1);
      expect(consoleLog.args[0][0]).to.include.any.string('already exists!');
      await fs.remove(publicFolder);
      await landingAdd({ name: landingName, slug: slugName });
      expect(consoleLog.callCount).to.equal(2);
      expect(consoleLog.args[0][0]).to.include.any.string('already exists!');
      await fs.remove(viewFolder);
      console.log.restore();
    });
  });
  describe('Landing Remove Command', () => {
    it('give name and slug should remove a landing', async () => {
      const landing = await landingAdd({ name: 'Test34ee45e938480' });
      await landingRemove({ name: landing.name, slug: landing.slug });
      expect(baseView).to.be.a.path();
      expect(basePublic).to.be.a.path();
      expect(path.join(baseView, landing.slug)).to.not.be.a.path();
      expect(path.join(basePublic, landing.slug)).to.not.be.a.path();
      const tinyLanding = await db.LandingPage.findOne({ where: { slug: landing.slug } });
      expect(tinyLanding).to.be.a('null');
    });
    it('give no parameters should give error', async () => {
      const consoleLog = sinon.spy(console, 'log');
      await landingRemove();
      expect(consoleLog.callCount).to.equal(1);
      expect(consoleLog.args[0][0]).to.include.any.string('name or slug or id is mandatory for delete landing');
      /* eslint-disable no-console */
      console.log.restore();
    });
    it('call landingRemove with unknown landing', async () => {
      const consoleLog = sinon.spy(console, 'log');
      await landingRemove({ name: 'unknown landing' });
      expect(consoleLog.callCount).to.equal(1);
      expect(consoleLog.args[0][0]).to.include.any.string('landing is not found');
      /* eslint-disable no-console */
      console.log.restore();
    });
  });
});
