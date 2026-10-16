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
2. No SQL Editor do projeto, execute [`supabase/setup.sql`](./supabase/setup.sql). Ele cria o bucket público `inaude-album`, limita cada arquivo a 100 MB e permite listar e enviar arquivos sem conta.
3. Copie `.env.example` para `.env.local` e informe a URL do projeto e a chave publicável/anon do Supabase:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   ```

4. Reinicie o servidor Vite.

O envio aceita até 10 arquivos por vez: JPG, PNG, WebP, GIF, MP4, MOV e WebM. Os nomes informados aparecem no álbum. Como o álbum é público e o envio não exige conta, qualquer pessoa com acesso ao site pode ver e enviar lembranças; não coloque uma chave `service_role` no frontend. A tela pede confirmação de autorização antes de enviar.

## Build de produção

```sh
npm run build
npm run preview
```
