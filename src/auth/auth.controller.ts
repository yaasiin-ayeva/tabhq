import { Request, Response, Router } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { validateDto } from "../common/middlewares/validate.middleware";

const router = Router();
const service = new AuthService();

router.post("/register", validateDto(RegisterDto), async (req: Request, res: Response) => {
    try {
        const dto = req.body as RegisterDto;
        const result = await service.register(dto.firstName, dto.lastName, dto.email, dto.password, dto.orgName);

        res.status(201).json({
            message: "User registered successfully",
            data: result,
        });
    } catch (err: any) {
        res.status(400).json({
            message: "Registration failed",
            error: err.message
        });
    }
});

router.post("/login", validateDto(LoginDto), async (req: Request, res: Response) => {
    try {
        const dto = req.body as LoginDto;
        const result = await service.login(dto.email, dto.password);

        res.json({
            message: "Login successful",
            data: result,
        });
    } catch (err: any) {
        res.status(400).json({
            message: "Login failed",
            error: err.message
        });
    }
});

export default router;
