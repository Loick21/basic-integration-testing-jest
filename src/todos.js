const Router = require("koa-router")

const router = Router({ prefix: "/todos" })
const { getDB } = require("./database")
const {ObjectId} = require("mongodb");

router
    .get("/", listTodos)
    .post("/", createTodo)
    .put("/:id", updateTodo)
    .del("/:id", deleteTodo)

async function listTodos (ctx) {
    const todos = await getDB()
        .collection("todos")
        .find({})
        .sort({ _id: 1 })
        .toArray()

    ctx.body = todos
}

async function createTodo (ctx) {
    const title = ctx.request.body.title.trim();

    if (title === null || title === undefined) {
        ctx.status = 422
        ctx.body = { errorMsg: "Missing parameter 'title'" }
    }
    else if(title === ""){
        ctx.status = 422
        ctx.body = { errorMsg: "invalid'title'" }
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

async function deleteTodo (ctx) {
    const id = ctx.request.params.id;
    const todo = await getDB()
        .collection("todos")
        .findOne({_id: ObjectId(id)});

    if(!todo)  {
        ctx.status = 404;
        ctx.body = {errorMsg: `${id} not found`}
        return;
    }

    try{
        await getDB()
            .collection("todos")
            .deleteOne({ _id: ObjectId(id) });
        ctx.status = 204;
        ctx.body = { message: `${id} deleted` }
    }
    catch (error){
        console.log(error);
    }
}

async function updateTodo (ctx) {
    // TODO
    const id = ctx.request.params.id;

    try{
        await getDB()
            .collection("todos")
            .up
        ctx.status = 200;
        ctx.body = { message: "updated"};
    }
    catch (error){
        if(error instanceof BSONTypeError)
        ctx.status = 400;
        ctx.body = { message: "not updated"};
    }
}

module.exports = router
