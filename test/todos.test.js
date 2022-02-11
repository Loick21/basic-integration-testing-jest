const {ObjectId} = require("mongodb")
const request = require("supertest")
const app = require("../src/app")
const {connectToDB, closeConnection, getDB} = require("../src/database")

const baseUrl = "/todos";

beforeAll(async () => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
    const MONGODB_DB = process.env.MONGODB_DB || 'mytodos-test'

    await connectToDB(MONGODB_URI, MONGODB_DB)
});

beforeEach(async () => {
    const db = getDB();
    await db.createCollection("todos");
/*    const data = [
        {
            _id: 1,
            title: "title",
            completed: false,
            createdAt: "2021",
            updatedAt: "2022"
        }
    ];
   db.collection("todos").insertMany(data, function (err, res) {
        if (err) throw err;
        console.log("Number of documents inserted: " + res.insertedCount);
    });*/
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
        const response = await request(app.callback()).get(baseUrl);
        expect(response.statusCode).toBe(200);
    });

    test("should respond with LIST OF JSON", async () => {
        const response = await request(app.callback()).get(baseUrl);
        expect(response.type).toBe("application/json");
    });

    test("should respond with list of existing todos", async () => {
        const response = await request(app.callback()).get(baseUrl);
        const data = [{
            _id: 1,
            title: "title",
            completed: false,
            createdAt: "2021",
            updatedAt: "2022"
        }];
        expect(response.body).toStrictEqual(data);
    });
});

// POST todos

describe("POST /todos", () => {
    test("should respond with a 200 status code", async () => {
        const data = { title: "titleTwo" };
        const response = await request(app.callback())
            .post(baseUrl)
            .send(data);
        expect(response.statusCode).toBe(200);
    });

    test("should respond with a 422 status code without title", async () => {
        const data = { };
        const response = await request(app.callback())
            .post(baseUrl)
            .send(data);
        expect(response.statusCode).toBe(422);
        expect(response.body).toBe({ errorMsg: "Missing parameter 'title'" });
        console.log(response.body)
    });

    test("should respond with a 422 status code with title blank", async () => {
        const data = { title: "    " };
        const response = await request(app.callback())
            .post(baseUrl)
            .send(data);
        expect(response.statusCode).toBe(422);
    });

});

describe("DELETE todos", () => {

    test("should delete ", async () => {
        const data = { title: "titleTwo" };
        await request(app.callback())
            .post(baseUrl)
            .send(data);

        const create_response = await request(app.callback()).get(baseUrl);
        const receive_data = create_response.body.shift();
        const delete_response = await request(app.callback())
            .delete(`${baseUrl}/${receive_data._id}`);

        console.log(delete_response.body)
        expect(delete_response.statusCode).toBe(204);
        expect(delete_response.body).toBe({message:"deleted"});
    });

});