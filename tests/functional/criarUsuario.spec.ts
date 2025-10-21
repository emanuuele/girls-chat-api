import { test } from "@japa/runner";
test.group("Criar Usuário", (group) => {
  test("post /criar-usuario", async ({ client }) => {
    const userData = {
      email: "usuario@example.com",
      password: "senha123",
      name: "Usuário Teste"
    };
    const response = await client.post("/criar-usuario").json(userData);
    console.log(response.body());
    
    response.assertStatus(200);
    response.assertBodyContains({ success: true });
    response.assertBodyContains({ user: { email: userData.email, name: userData.name } });
  });
});