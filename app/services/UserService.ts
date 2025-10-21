import User from "App/Models/User";
import { isValidEmail } from "../../utils/validation";
import { md5 } from "js-md5";

export default class UserService {
    public async getUserByEmailAndPassword(email: string, password: string) {
        try {
            if (!email || !password || !isValidEmail(email)) {
                throw new Error("Preencha o campo senha e e-mail corretamente")
            }
            const userSnapshot = await User.query()
                .where('email', email)
                .where('password', md5(password))
                .first();
            if (!userSnapshot) {
                throw new Error("Usuário não encontrado")
            }
            return userSnapshot;
        } catch (error) {
            throw new Error("Erro ao buscar usuário: " + error.message);
        }
    }

    public async createUser(email: string, password: string, name: string) {
        try {
            if (!email || !password || !name || !isValidEmail(email)) {
                throw new Error("Preencha todos os campos corretamente")
            }
            const userSnapshot = await User.query()
                .where('email', email)
                .first();
            if (userSnapshot) {
                throw new Error("E-mail já cadastrado")
            }
            const newUser = {
                email,
                password: md5(password),
                name
            }
            const user = await User.create(newUser);
            return user;
        } catch (error) {
            throw new Error("Erro ao criar usuário: " + error.message);
        }
    }

    public async updateUser(userID: string, updatedData: any) {
        try {
            if (!userID) {
                throw new Error("O ID do usuário é obrigatório");
            }
            const userSnapshot = await User.query().where('id', userID).first();
            if (!userSnapshot) {
                throw new Error("Usuário não encontrado");
            }
            userSnapshot.merge(updatedData);
            await userSnapshot.save();
            return userSnapshot;
        } catch (error) {
            throw new Error("Erro ao atualizar usuário: " + error.message);
        }
    }

    public async getAllUsersExcept(userID: string | number) {
        try {
            if (!userID) {
                throw new Error("O ID do usuário é obrigatório")
            }
            const users = await User.query().whereNot('id', userID);
            return users;
        } catch (error) {
            throw new Error("Erro ao buscar usuários: " + error.message);
        }
    }
}
