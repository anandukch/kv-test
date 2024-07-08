import { NextFunction, Request, Response, Router } from "express";
import EmployeeService from "../service/employee.service";
import HttpException from "../exceptions/http.exceptions";
import { CreateEmployeeDto, EmployeeResposneDto, LoginDto, UpdateEmployeeDto } from "../dto/employee.dto";
import { authorize } from "../middleware/authorize.middleware";
import { RequestWithUser } from "../utils/requestWithUser";
import { Role } from "../utils/role.enum";
import validationMiddleware from "../middleware/validate.middleware";
import { reponseHandler } from "../utils/reponse.utils";

class EmployeeController {
    public router: Router;
    constructor(private employeeService: EmployeeService) {
        this.router = Router();
        this.router.get("/", authorize([Role.HR]), this.getAllEmployees);
        this.router.get("/:id", this.getEmployee);
        this.router.post("/", authorize([Role.HR]), validationMiddleware(CreateEmployeeDto), this.createEmployee);
        this.router.put("/:id", authorize([Role.HR]), validationMiddleware(UpdateEmployeeDto), this.updateEmployee);
        this.router.delete("/:id", authorize([Role.HR]), this.deleteEmployee);

        //authentication
        this.router.post("/login", validationMiddleware(LoginDto), this.login);
    }

    public login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const loginDto = req.body as LoginDto;
            const token = await this.employeeService.loginEmployee(loginDto.email, loginDto.password);
            res.status(200).json(reponseHandler("success", "Login successful", { token }));
        } catch (error) {
            next(error);
        }
    };

    public getAllEmployees = async (_: Request, res: Response, next: NextFunction) => {
        try {
            const employees = await this.employeeService.getAllEmployees();
            if (employees.length == 0) throw new HttpException(404, "No employees found");

            res.status(200).send(
                reponseHandler(
                    "success",
                    "Employees found",
                    employees.map((employee) => new EmployeeResposneDto(employee))
                )
            );
        } catch (error) {
            next(error);
        }
    };

    public getEmployee = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const employeeId = Number(req.params.id);
            const employee = await this.employeeService.getEmployeeById(employeeId);
            if (!employee) {
                throw new HttpException(404, `No employee found with id : ${employeeId}`);
            }
            res.status(200).json(reponseHandler("success", "Employee found", new EmployeeResposneDto(employee)));
        } catch (error) {
            next(error);
        }
    };

    public createEmployee = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const newEmployee = await this.employeeService.createEmployee(req.body);
            res.status(200).json(reponseHandler("success", "Employee created", new EmployeeResposneDto(newEmployee)));
        } catch (error) {
            next(error);
        }
    };

    public updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const updatedEmployeeData = req.body;
            const employeeId = Number(req.params.id);
            await this.employeeService.updateEmployee(employeeId, updatedEmployeeData);
            res.status(200).json(reponseHandler("success", "Employee updated"));
        } catch (error) {
            next(error);
        }
    };

    public deleteEmployee = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.employeeService.deleteEmployee(Number(req.params.id));
            res.status(204).json(reponseHandler("success", "Employee deleted"));
        } catch (error) {
            next(error);
        }
    };
}

export default EmployeeController;
