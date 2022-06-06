import bcrypt from "bcrypt"
import prisma from "../lib/prisma";
import {ErrorHandler} from "../lib/errorHandler";
import UsersService from "./Users.service";
import {makeid, signToken} from "../lib/utils";
import nodemailer from "nodemailer"
import jwt, {JwtPayload} from "jsonwebtoken";
import {User} from "@prisma/client";

const config = {
    host: "smtp.mail.ru",
    port: 465,
    secure: true,
    auth: {
        user: "alna.blinova.04@mail.ru",
        pass: "0hytkpkV84nNQhNzqv68"
    }
}

const emailSender = nodemailer.createTransport(config)

class AuthService {

    async resetPassword(code: string, password: string) {
        let verified;
        try {
            verified = jwt.verify(code, process.env.PASSWORD_SECRET) as JwtPayload
        } catch (e) {
            throw new ErrorHandler(401, "Код смены пароля не верный")
        }
        if (!verified) throw new ErrorHandler(401, "Код смены пароля не верный")
        const candidate = await UsersService.findOne({id: verified.id})
        if (!candidate) throw new ErrorHandler(401, "Код смены пароля не верный")
        if (verified.oldPassword !== candidate.password) throw new ErrorHandler(401, "Код смены пароля не верный")
        const hashPassword = await bcrypt.hash(password, 10)
        await UsersService.update(candidate.id, {
            password: hashPassword
        })

        await emailSender.sendMail({
            from: '"toys" <alna.blinova.04@mail.ru>', // sender address
            to: candidate.email, // list of receivers
            subject: "Восстановление пароля", // Subject line
            html: `<h3>Восстановление пароля</h3>
                   <p>Пароль был успешно изменен, если вы этого не делали - обратитесь к администратору по этой почте</p>`,
        });

        return true
    }

    async forgotPassword(email: string) {
        const candidate = await UsersService.findOne({email})
        if (!candidate) {
            console.log("Пользователь не найден")
            return true
        }
        if (!candidate.emailConfirmed) {
            console.log(`Email ${candidate.email} не подтвержден, не отправляем`)
            return true
        }

        const jwtCode = jwt.sign({
            id: candidate.id,
            oldPassword: candidate.password
        }, process.env.PASSWORD_SECRET, {
            expiresIn: "10m"
        })

        await emailSender.sendMail({
            from: '"toys" <alna.blinova.04@mail.ru>', // sender address
            to: candidate.email, // list of receivers
            subject: "Восстановление пароля", // Subject line
            html: `<h3>Восстановление пароля</h3>
                   <p>Если вы не запрашивали восстановления пароля - игнорируйте письмо</p>
                   <a href='${process.env.BASE_URL}/reset/?code=${jwtCode}'>Сссылка для восстановления</a>`,
        });

        return true
    }


    async sendVerificationEmail(user: User) {
        if (user.emailConfirmed) throw new ErrorHandler(401, "Ваш Email уже подтвержден")

        const {emailConfirmationCode} = await UsersService.update(user.id, {
            emailConfirmationCode: makeid(6)
        })

        await emailSender.sendMail({
            from: '"toys" <alna.blinova.04@mail.ru>', // sender address
            to: user.email, // list of receivers
            subject: "Подтверждение Email", // Subject line
            html: `<h3>Подтверждение Email</h3><p>Если вы не запрашивали - игнорируйте письмо</p>
            Ваш код подтверждения: ${emailConfirmationCode}`,
        });

        return true
    }

    async verifyEmail(user: User, code: string) {
        if (user.emailConfirmed) throw new ErrorHandler(401, "Ваш Email уже подтвержден")
        if (!code || code.length < 1) throw new ErrorHandler(401, "Не указан код")
        if (user.emailConfirmationCode !== code) throw new ErrorHandler(401, "Неверный код потдверждения")
        await UsersService.update(user.id, {
            emailConfirmationCode: null,
            emailConfirmed: new Date()
        })
        return true
    }

    async signUp(signUpDTO) {
        if (!signUpDTO) throw new ErrorHandler(401, "Нет данных для регистрации")
        const {password, email, username} = signUpDTO
        if (!email || !username || !password) throw new ErrorHandler(401, "Не все данные указаны")
        const hashedPassword = await bcrypt.hash(password, 10)
        const candidate = await prisma.user.findFirst({
            where: {username, email}
        })
        if (candidate) throw new ErrorHandler(401, "Пользователь с таким email или username уже существует")
        const user = await UsersService.create({...signUpDTO, password: hashedPassword})
        const accessToken = signToken({id: user.id, role: user.role})
        return {accessToken}
    }

    async signIn(signInDTO) {
        if (!signInDTO) throw new ErrorHandler(401, "Нет данных для авторизации")
        const {email, password} = signInDTO
        if (!email) throw new ErrorHandler(401, "Нет Email'а")
        if (!password) throw new ErrorHandler(401, "Нет Пароля")
        const candidate = await UsersService.findOne({email})
        if (!candidate) throw new ErrorHandler(401, "Не верный Email или Пароль")
        const passwordEquals = await bcrypt.compare(password, candidate.password)
        if (!passwordEquals) throw new ErrorHandler(401, "Не верный Email или Пароль")
        const accessToken = signToken({id: candidate.id, role: candidate.role})
        return {accessToken}
    }
}

export default new AuthService()