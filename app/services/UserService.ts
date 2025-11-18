import User from "App/Models/User";
import { isValidEmail } from "../../utils/validation";
import { md5 } from "js-md5";
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';
import { FirebaseAdminService } from "./FirebaseAdmin";


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

    public async updateUser(userID: string, updatedData: { UF?: string; city?: string; bio?: string; name?: string; email?: string; password?: string; profile_picture?: string }) {
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

    public async getUserById(userID: string | number) {
        try {
            if (!userID) {
                throw new Error("O ID do usuário é obrigatório")
            }
            let user = await User.find(userID);
            if (!user) {
                throw new Error("Usuário não encontrado")
            }
            return user;
        } catch (error) {
            throw new Error("Erro ao buscar usuário: " + error.message);
        }
    }

    public async saveProfilePicture(userID: string | number, file: MultipartFileContract) {
        try {
            if (!userID || !file) {
                throw new Error("O ID do usuário e a imagem são obrigatórios");
            }
            const user = await User.find(userID);
            if (!user) {
                throw new Error("Usuário não encontrado");
            }
            user.profile_picture = `${userID}.${file.extname}`;
            const metadata = await this.saveProfilePictureGoogleStorage(file, user.profile_picture);
            if (!metadata || !metadata.publicUrl()) {
                throw new Error("Falha ao fazer upload da imagem");
            }
            console.log("chegou aqui");
            await metadata.makePublic()
            user.profile_picture = metadata.publicUrl();
            await user.save();
            console.log("chegou aquiii");
            return user;
        } catch (error) {
            throw new Error("Erro ao salvar imagem de perfil: " + error.message);
        }
    }

    public async saveProfilePictureGoogleStorage(file: MultipartFileContract, filename: string) {
        try {
            
            const storage = FirebaseAdminService.getStorage();
            const defaultBucket = storage.bucket();
            const [uploadedFile] = await defaultBucket.upload(file.tmpPath!, {
                destination: filename,
                metadata: {
                    contentType: file.type,
                },
            });
            return uploadedFile;
        } catch (error) {
            throw new Error("Erro ao salvar imagem de perfil no Google Storage: " + error.message);
        }
    }
}
