const knex = require('knex')
const bcrypt = require('bcryptjs')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Create Account Endpoints', function() {
  let db

  const { testUsers } = helpers.makeFixtures()
  const testUser = testUsers[0]

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`POST /api/auth/register`, () => {
    context(`User Validation`, () => {
      beforeEach('insert users', () =>
        helpers.seedUsers(
          db,
          testUsers,
        )
      )

      const requiredFields = ['email', 'password', 'full_name']

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          email: 'test email',
          password: 'test password',
          full_name: 'test full_name',
        }

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field]

          return supertest(app)
            .post('/api/auth/register')
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`,
            })
        })
      })

      it(`responds 400 'Password be longer than 8 characters' when empty password`, () => {
        const userShortPassword = {
          email: 'test email',
          password: '1234567',
          full_name: 'test full_name',
        }
        return supertest(app)
          .post('/api/auth/register')
          .send(userShortPassword)
          .expect(400, { error: `Password be longer than 8 characters` })
      })

      it(`responds 400 'Password be less than 25 characters' when long password`, () => {
        const userLongPassword = {
          email: 'test email',
          password: '*'.repeat(73),
          full_name: 'test full_name',
        }
        return supertest(app)
          .post('/api/auth/register')
          .send(userLongPassword)
          .expect(400, { error: `Password be less than 25 characters` })
      })

      it(`responds 400 error when password starts with spaces`, () => {
        const userPasswordStartsSpaces = {
          email: 'test email',
          password: ' 1Aa!2Bb@',
          full_name: 'test full_name',
        }
        return supertest(app)
          .post('/api/auth/register')
          .send(userPasswordStartsSpaces)
          .expect(400, { error: `Password must not start or end with empty spaces` })
      })

      it(`responds 400 error when password ends with spaces`, () => {
        const userPasswordEndsSpaces = {
          email: 'test email',
          password: '1Aa!2Bb@ ',
          full_name: 'test full_name',
        }
        return supertest(app)
          .post('/api/auth/register')
          .send(userPasswordEndsSpaces)
          .expect(400, { error: `Password must not start or end with empty spaces` })
      })


      it(`responds 400 'Email already taken' when email isn't unique`, () => {
        const duplicateUser = {
          email: testUser.email,
          password: '11AAaa!!',
          full_name: 'test full_name',
        }
        return supertest(app)
          .post('/api/auth/register')
          .send(duplicateUser)
          .expect(400, { error: `Email already taken` })
      })
    })

    context(`Happy path`, () => {
      it(`responds 201, serialized user, storing bcryped password`, () => {
        const newUser = {
          email: 'test@email.com',
          password: '11AAaa!!',
          full_name: 'test full_name',
        }
        return supertest(app)
          .post('/api/auth/register')
          .send(newUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id')
            expect(res.body.email).to.eql(newUser.email)
            expect(res.body.full_name).to.eql(newUser.full_name)
            expect(res.body).to.not.have.property('password')
            expect(res.headers.location).to.eql(`/api/auth/register/${res.body.id}`)
            const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
            const actualDate = new Date(res.body.date_created).toLocaleString()
            expect(actualDate).to.eql(expectedDate)
          })
          .expect(res =>
            db
              .from('harvest_table_users')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.email).to.eql(newUser.email)
                expect(row.full_name).to.eql(newUser.full_name)
                const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                const actualDate = new Date(row.date_created).toLocaleString()
                expect(actualDate).to.eql(expectedDate)

                return bcrypt.compare(newUser.password, row.password)
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true
              })
          )
      })
    })
  })
})