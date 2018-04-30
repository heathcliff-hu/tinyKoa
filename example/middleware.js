let TinyKoa = require("../src/application");

let app = new TinyKoa();

let responseData = {};

app.use(async(ctx, next) => {
  responseData.name = "Heathcliff Huu";
  await next();
  ctx.body = responseData;
});

app.use(async(ctx, next) => {
  responseData.age = 24;
  await next();
});

app.use(async(ctx, next) => {
  responseData.sex = "Man";
  await next();
});

app.listen(3000, () => {
  console.log("Listening on 3000");
});
