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
        const todo = {
            title: "title",
            completed: false,
        };
        const create_response = await request(app.callback())
            .post(baseUrl)
            .send(todo);

        const get_response = await request(app.callback()).get(baseUrl);

        expect(get_response.body.length).toStrictEqual(1);
        expect(get_response.body[0].title).toStrictEqual("title");
        expect(get_response.body[0].completed).toStrictEqual(false);
    });
});

// POST todos

describe("POST /todos", () => {
    test("should respond with a 200 status code", async () => {
        const data = {title: "titleTwo"};
        const response = await request(app.callback())
            .post(baseUrl)
            .send(data);
        expect(response.statusCode).toBe(200);
        expect(ObjectId.isValid(response.body.id)).toBe(true);
    });

    test("should respond with a 422 status code without title", async () => {
        const data = {};
        const response = await request(app.callback())
            .post(baseUrl)
            .send(data);
        expect(response.statusCode).toBe(422);
        expect(response.body.errorMsg).toBe("Missing parameter 'title'");
    });

    test("should respond with a 422 status code with a blank title ", async () => {
        const data = {title: "    "};
        const response = await request(app.callback())
            .post(baseUrl)
            .send(data);
        expect(response.statusCode).toBe(422);
    });

});

describe("DELETE /todos/:id", () => {

    test("should delete and return 204 ", async () => {
        const data = {title: "titleTwo"};
        const create_response = await request(app.callback())
            .post(baseUrl)
            .send(data);

        const id = JSON.parse(create_response.text).id;

        const delete_response = await request(app.callback())
            .delete(`${baseUrl}/${id}`);
        expect(delete_response.statusCode).toBe(204);
    });

    test("invalid id should return 400  ", async () => {
        const id = 1;
        const delete_response = await request(app.callback())
            .delete(`${baseUrl}/${id}`);
        expect(delete_response.statusCode).toBe(400);
        expect(delete_response.body.errorMsg).toBe("id not valid");
    });
    test("not found todo for id should  return 404  ", async () => {
        const id = "62095ba420d5d27fa5a3bdfb";
        const delete_response = await request(app.callback())
            .put(`${baseUrl}/${id}`);
        expect(delete_response.statusCode).toBe(404);
        expect(delete_response.body.errorMsg).toBe(`${id} not found`);
    });

});

describe("PUT todos/:id", () => {

    test("should update and return 200", async () => {
        const data = {title: "titleTwo"};
        const response = await request(app.callback())
            .post(baseUrl)
            .send(data);

        const id = JSON.parse(response.text).id;
        console.log(id)
        const body = {
            title: "titleOne",
        };
        const update_response = await request(app.callback())
            .put(`${baseUrl}/${id}`)
            .send(body);
        expect(update_response.statusCode).toBe(200);
        expect(update_response.body.message).toBe("updated");
    });

    test("invalid id should return 400  ", async () => {
        const id = 1;
        const body = {
            title: "titleOne",
        };
        const update_response = await request(app.callback())
            .put(`${baseUrl}/${id}`)
            .send(body);
        expect(update_response.statusCode).toBe(400);
        expect(update_response.body.errorMsg).toBe("id not valid");
    });
    test("not found todo for id should  return 404  ", async () => {
        const id = "62095ba420d5d27fa5a3bdfb";
        const body = {
            title: "titleOne",
        };
        const update_response = await request(app.callback())
            .put(`${baseUrl}/${id}`)
            .send(body);
        expect(update_response.statusCode).toBe(404);
        expect(update_response.body.errorMsg).toBe(`${id} not found`);
    });
});