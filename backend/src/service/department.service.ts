import Department from "../entity/department.entity";
import HttpException from "../exceptions/http.exceptions";
import DepartmentRepository from "../repository/department.repository";

class DepartmentService {
    constructor(private departmentRepository: DepartmentRepository) {}

    getAllDepartments = async () => {
        return this.departmentRepository.find();
    };

    getDepartmentById = async (id: number, relations?: {}) => {
        return this.departmentRepository.findOneBy({ id }, relations);
    };
    getDepartmentByName = async (name: string) => {
        return this.departmentRepository.findOneBy({ name });
    };

    createDepartment = async (name: string) => {
        const existingDepartment = await this.departmentRepository.findOneBy({ name });
        if (existingDepartment) {
            throw new HttpException(400, `Department with name :${name} already exists`);
        }
        const newDepartment = new Department();
        newDepartment.name = name;
        return this.departmentRepository.create(newDepartment);
    };

    updateDepartment = async (id: number, department: Partial<Department>) => {
        const departmentToUpdate = await this.getDepartmentById(id);
        if (!departmentToUpdate) {
            throw new HttpException(404, `No department found with id :${id}`);
        }

        departmentToUpdate.name = department.name;
        return this.departmentRepository.save(departmentToUpdate);
    };

    deleteDepartment = async (id: number) => {
        const department = await this.getDepartmentById(id, { relations: ["employee"] });
        if (!department) {
            throw new HttpException(404, `No department found with id :${id}`);
        }
        if (department.employee.length > 0) {
            throw new HttpException(400, `Department with id :${id} has employees`);
        }
        return this.departmentRepository.softDelete(department);
    };
}

export default DepartmentService;
