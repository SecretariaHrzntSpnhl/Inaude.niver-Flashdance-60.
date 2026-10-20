# Inaude 60

Landing e álbum colaborativo para celebrar os 60 anos de Inaude Jr.

## Desenvolvimento

```sh
npm install
npm run dev
```

## Configurar o álbum compartilhado

O envio e a galeria usam o Supabase Storage. Sem essa configuração, a página não envia arquivos. O carrossel principal mostra fotos ilustrativas, identificadas como prévia; a galeria não apresenta imagens de exemplo como se fossem lembranças reais.

1. Crie um projeto no Supabase.
2. No SQL Editor do projeto, execute [`supabase/setup.sql`](./supabase/setup.sql). Ele cria o bucket público `inaude-album`, limita cada arquivo a 100 MB e permite listar e enviar arquivos sem conta. Se o bucket já estiver configurado, execute o SQL novamente para habilitar os novos formatos HEIC/HEIF.
3. Copie `.env.example` para `.env.local` e informe a URL do projeto e a chave publicável/anon do Supabase:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   ```

4. Reinicie o servidor Vite.

O envio aceita até 10 arquivos por vez: JPG, PNG, WebP, GIF, HEIC/HEIF, MP4, MOV e WebM. Em celulares, o seletor de fotos e vídeos abre a galeria do dispositivo; não força a abertura da câmera. Após o envio, as lembranças aparecem no carrossel da página inicial e na galeria do álbum. Os nomes informados aparecem no álbum. Como o álbum é público e o envio não exige conta, qualquer pessoa com acesso ao site pode ver e enviar lembranças; não coloque uma chave `service_role` no frontend. A tela pede confirmação de autorização antes de enviar.

## Moderação privada do álbum

O painel `/admin.html` exige uma conta de autenticação do Supabase e políticas de Storage que autorizam listar e excluir arquivos apenas para usuários explicitamente cadastrados como moderadores. A URL não é secreta nem substitui essas políticas. Convidados continuam podendo listar e enviar pelo fluxo público, mas não podem usar esse painel para moderar.

Para configurar a conta administradora:

1. No dashboard do Supabase, crie uma única conta em **Authentication → Users**, com o e-mail que você usará para moderar. Não compartilhe a senha e não habilite o cadastro público de usuários.
2. No **SQL Editor**, execute [`supabase/admin.sql`](./supabase/admin.sql).
3. No SQL Editor, substitua o e-mail abaixo pelo mesmo usado na conta criada e execute a consulta. Ela não concede acesso a outros usuários:

   ```sql
   insert into private.album_admins (user_id)
   select id
   from auth.users
   where lower(email) = lower('seu-email@exemplo.com')
   on conflict (user_id) do nothing;
   ```

4. Confira que somente sua conta está autorizada:

   ```sql
   select users.email
   from private.album_admins as admins
   join auth.users as users on users.id = admins.user_id;
   ```

5. Entre em `https://niver-inaude.netlify.app/admin.html` com essa conta. Antes de configurar a conta e executar o SQL, o painel não terá permissão para listar nem remover lembranças.

A remoção apaga permanentemente o arquivo do Storage. O carrossel público detecta a mudança na próxima atualização automática. Nunca exponha uma chave `service_role` no site ou no Netlify.

## Publicar no Netlify

O `netlify.toml` publica a pasta `dist` e executa `npm run build`. O build gera as páginas (`index.html`, `upload.html`, `galeria.html` e `admin.html`); não há reescrita geral para a página inicial, para que os endereços das páginas estáticas funcionem diretamente.

O `netlify.toml` configura a URL do projeto e a chave publicável/anon do Supabase para o build hospedado, sem depender do `.env.local` da máquina. Essas credenciais públicas são incorporadas ao frontend; nunca use nem publique uma chave `service_role`. Se definir variáveis de ambiente no painel do Netlify, elas podem substituir os valores do arquivo.

## Build de produção

```sh
npm run build
npm run preview
```
