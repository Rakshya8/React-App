import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Prisma from '@prisma/client';

const {
    PrismaClient
} = Prisma;
const prisma = new PrismaClient();

export const Register = async (req, res) => {
    const {
        name,
        email,
        password,
        confirmPassword
    } = req.body;
    if (password !== confirmPassword) return res.status(400).json({
        msg: "Password and Confirm Password do not match"
    });
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    try {
        await prisma.users.create({
            data: {
                name: name,
                email: email,
                password: hashPassword
            }
        });
        res.json({
            msg: "Registration Successful"
        });
    } catch (error) {
        console.log(error);
    } finally {
        await prisma.$disconnect();
    }
}

export const Login = async (req, res) => {
    try {
        const user = await prisma.users.findFirst({
            where: {
                email: req.body.email
            }
        });
        const match = await bcrypt.compare(req.body.password, user.password);

        if (!match) return res.status(400).json({
            msg: "Invalid password!"
        });
        const userId = user.id;
        const name = user.name;
        const email = user.email;
        const accessToken = jwt.sign({
            userId,
            name,
            email
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '15s'
        });
        const refreshToken = jwt.sign({
            userId,
            name,
            email
        }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });
        await prisma.users.update({
            data: {
                refresh_token: refreshToken
            },
            where: {
                id: userId
            }
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({
            accessToken
        });
    } catch (error) {
        res.status(404).json({
            msg: "Login credentials not found!"
        });
    } finally {
        await prisma.$disconnect();
    }
}

export const Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);
    const user = await prisma.users.findFirst({
        where: {
            refresh_token: refreshToken
        }
    });
    if (!user) return res.sendStatus(204);
    const userId = user.id;
    await prisma.users.update({
        data: {
            refresh_token: null
        },
        where: {
            id: userId
        }
    });
    await prisma.$disconnect();
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
}