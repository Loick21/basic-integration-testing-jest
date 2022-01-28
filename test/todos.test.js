const { ObjectId } = require("mongodb")
const request = require("supertest")
const app = require("../src/app")
const { connectToDB, closeConnection, getDB } = require("../src/database")

const baseUrl = "/todos"

beforeAll(async () => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
    const MONGODB_DB = process.env.MONGODB_DB || 'mytodos-test'

    await connectToDB(MONGODB_URI, MONGODB_DB)
});

beforeEach(async () => {
    const db = getDB();
    await db.createCollection("todos");
});


afterEach(async () => {
    const db = getDB();
    await db.dropCollection("todos");
});

afterAll(async () => {
    closeConnection()
});

describe("GET /todos", () => {
    test("should respond with a 200 status code", async () => {
        // TODO
        fail("Not yet implemented")
    })

    test("should respond with JSON", async () => {
        // TODO
        fail("Not yet implemented")
    })

    test("should respond with list of existing todos", async () => {
        // TODO
        fail("Not yet implemented")
    })
})
