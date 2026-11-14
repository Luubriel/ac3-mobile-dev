# Controle de Gastos

**Aluno:** Lucas Gabriel (`Luubriel`)

Aplicativo de controle de gastos pessoais feito em React Native + Expo (SDK 55), com tema escuro nas cores ciano (`#39c5bb`), magenta (`#ff2a85`) e fundo escuro (`#0d1117`).

## Funcionalidades

- **Lista de gastos (Tela 1):** exibe todos os gastos com `FlatList` e mostra o total acumulado no topo, atualizado automaticamente. Cada gasto pode ser removido individualmente.
- **Formulário (Tela 2):** cadastro com valor, descrição e categoria. A validação aparece na própria tela (sem `Alert`) e o app volta para a lista automaticamente após salvar.
- **Persistência:** os gastos são salvos e carregados localmente com `@react-native-async-storage/async-storage`.
- **Extras implementados:**
  - Campo de categoria (`Alimentação`, `Transporte`, `Lazer`, `Outros`).
  - Destaque visual em magenta para gastos acima de R$ 100.
  - Botão **Limpar tudo** para esvaziar a lista de uma vez.
  - Resumo com quantidade de lançamentos e quantos passam de R$ 100.
  - Barra de distribuição mostrando a porcentagem gasta em cada categoria.

## Estrutura

```
src/
├── app/                  # Rotas (Expo Router)
│   ├── _layout.tsx       # Stack de navegação
│   ├── index.tsx         # Tela 1 — lista
│   └── form.tsx          # Tela 2 — formulário
└── screens/
    ├── home/home.tsx     # Lista, total, resumo e exclusão
    └── form/form.tsx     # Cadastro e validação
```

## Como rodar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Inicie o projeto no Expo:

   ```bash
   npx expo start
   ```

3. Escaneie o QR code com o app **Expo Go** (celular e computador na mesma rede) ou pressione `w` para abrir no navegador.
