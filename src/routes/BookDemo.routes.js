import { Router } from "express";
import { AddBookDemo, DeleteBookDemo, getBookedDemo } from "../controller/BookDemo.controller.js";
import { Validater } from "../helper/checkValidation.js";
import { BookDemoValidation } from "../validation/BookDemo.validation.js";

const routes = Router();

routes.route("/add-book-demo").post(Validater(BookDemoValidation),AddBookDemo);
routes.route("/get-all-book").get(getBookedDemo);
routes.route("/delete-book/:id").delete(DeleteBookDemo);


export default routes;



