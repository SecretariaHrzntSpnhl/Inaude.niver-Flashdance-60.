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

## Publicar no Netlify

O `netlify.toml` publica a pasta `dist` e executa `npm run build`. O build gera as três páginas (`index.html`, `upload.html` e `galeria.html`); não há reescrita geral para a página inicial, para que os endereços das páginas estáticas funcionem diretamente.

No Netlify, configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em **Site configuration → Environment variables** e faça um novo deploy. Essas variáveis são incorporadas ao frontend durante o build. Sem elas, a página informa que o álbum não está conectado e não envia arquivos.

## Build de produção

```sh
npm run build
npm run preview
```
