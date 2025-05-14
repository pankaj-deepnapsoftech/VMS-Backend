import { Router } from "express";
import { AddBookDemo, getBookedDemo } from "../controller/BookDemo.contoller.js";
import { Validater } from "../helper/checkValidation.js";
import { BookDemoValidation } from "../validation/BookDemo.validation.js";

const routes = Router();

routes.route("/add-book-demo").post(Validater(BookDemoValidation),AddBookDemo);
routes.route("/get-all-book").get(getBookedDemo);


export default routes;



