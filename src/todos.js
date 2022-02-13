const Router = require("koa-router")

const router = Router({prefix: "/todos"})
const {getDB} = require("./database")
const {ObjectId} = require("mongodb");

router
    .get("/", listTodos)
    .post("/", createTodo)
    .put("/:id", updateTodo)
    .del("/:id", deleteTodo)

async function listTodos(ctx) {
    const todos = await getDB()
        .collection("todos")
        .find({})
        .sort({_id: 1})
        .toArray()

    ctx.body = todos
}

async function createTodo(ctx) {
    let title = ctx.request.body.title;

    if (title === null || title === undefined) {
        ctx.status = 422
        ctx.body = {errorMsg: "Missing parameter 'title'"}
        return;
    }
    title = title.trim();
    if (title === "") {
        ctx.status = 422
        ctx.body = {errorMsg: "invalid'title'"}
    }
    else {
        const result = await getDB().collection("todos").insertOne({
            title,
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        ctx.body = { id: result.insertedId }
    }
}

async function deleteTodo(ctx) {
    const id = ctx.request.params.id;
    if(!ObjectId.isValid(id)) {
        ctx.status = 400;
        ctx.body = {errorMsg : "id not valid"};
        return;
    }
    const todo = await getDB()
        .collection("todos")
        .findOne({_id: ObjectId(id)});

    if (!todo) {
        ctx.status = 404;
        ctx.body = {errorMsg: `${id} not found`}
        return;
    }

    try {
        await getDB()
            .collection("todos")
            .deleteOne({_id: ObjectId(id)});
        ctx.status = 204;
    } catch (error) {}
}

async function updateTodo(ctx) {
    const id = ctx.request.params.id;
    if(!ObjectId.isValid(id)) {
        ctx.status = 400;
        ctx.body = {errorMsg : "id not valid"};
        return;
    }
    const body = ctx.request.body;
    const todo = await getDB()
        .collection("todos")
        .findOne({_id: ObjectId(id)});

    if (!todo) {
        ctx.status = 404;
        ctx.body = {errorMsg: `${id} not found`}
        return;
    }
    try {
        await getDB()
            .collection("todos")
            .updateOne(
                {_id: id},
                { $set: body}
            );
        ctx.status = 200;
        ctx.body = {message: "updated"};
    } catch (error) {}
}

module.exports = router
