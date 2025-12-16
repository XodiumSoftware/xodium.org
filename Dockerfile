FROM denoland/deno:latest

WORKDIR /app

COPY deno.json deno.lock* ./

RUN deno install

COPY . .

RUN deno run --unstable-kv -A npm:vite build

EXPOSE 8000

CMD ["deno", "task", "start"]