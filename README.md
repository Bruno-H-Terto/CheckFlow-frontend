# Checkflow Frontend

Interface React básica para a API e o WebSocket do Checkflow.

## Executar

```bash
npm install
npm run dev
```

Por padrão, o servidor de desenvolvimento do Vite encaminha:

- `/api` para `http://localhost:8000`;
- `/realtime` para `ws://localhost:8001`.

Para outro ambiente, copie `.env.example` para `.env` e configure
`VITE_API_URL` e `VITE_WS_URL`. Em produção, o proxy reverso deve encaminhar
esses caminhos ou o backend deve permitir a origem do frontend via CORS.

## Funcionalidades

- criação e seleção de planos;
- listagem e criação de steps por JSON;
- disparo e histórico de execuções;
- cancelamento e retry;
- acompanhamento do stream realtime por WebSocket.
