# Curiculobrasil

Crie um aplicativo web de página única chamado "Meu Currículo", para montar um
currículo respondendo perguntas, uma de cada vez. O público é variado: alunos de
ensino médio fazendo o primeiro currículo, mas também pessoas com curso técnico,
graduação ou pós-graduação. O app se adapta ao perfil de quem responde.

O app NÃO é um formulário. É uma conversa: uma pergunta por tela, a pessoa responde,
avança. No fim, o currículo aparece pronto para revisar e baixar em PDF.

================== REGRA CRÍTICA DE PRIVACIDADE ==================
Não viole em nenhuma hipótese:
- 100% client-side. NÃO crie backend, NÃO use Supabase, NÃO use banco de dados,
  NÃO crie login, NÃO envie dados para servidor nenhum.
- Os dados existem apenas no estado do React; o PDF é gerado no navegador.
- Aviso permanente no rodapé: "Seus dados não são salvos em nenhum servidor. Ao
  fechar esta página, tudo é apagado. Baixe seu PDF antes de sair."
==================================================================

FORMATO DAS TELAS
- Uma pergunta por vez, centralizada, fonte grande, campo de resposta abaixo.
- Botões "Voltar" e "Continuar"; Enter também avança.
- Barra de progresso fina no topo com a etapa atual. Como o roteiro é adaptativo,
  o total de etapas é calculado depois da pergunta de perfil.
- Transição suave entre perguntas.
- Perguntas opcionais têm link discreto "Pular essa".
- Português do Brasil, linguagem direta, tratamento por "você". Sem jargão de RH,
  sem tom infantil e sem formalidade excessiva — atende dos 15 aos 60 anos.

================== ROTEIRO ==================

BLOCO 1 — IDENTIFICAÇÃO
1. "Vamos começar. Qual é o seu nome completo?"
   Dica: "Nome completo, como está no documento."
2. "Em que cidade você mora?" (cidade e estado)
3. "Qual telefone deve ser usado para entrar em contato?" + checkbox "É WhatsApp"
4. "Qual é o seu e-mail?"
   Dica: "Use um e-mail com o seu nome. Se o seu for tipo 'gatinha2008@', vale
   criar um novo — leva dois minutos e evita porta fechada."
5. "Você tem LinkedIn ou portfólio online?" (opcional, campo de link)

BLOCO 2 — PERGUNTA DE PERFIL (define todo o resto)
6. "Qual é a sua formação mais alta até agora?"
   Opções clicáveis:
   A) Ensino médio — cursando
   B) Ensino médio — concluído
   C) Curso técnico — cursando ou concluído
   D) Graduação — cursando ou concluída
   E) Pós-graduação, mestrado ou doutorado

   A resposta define o CAMINHO:
   - A ou B  → CAMINHO INICIANTE
   - C, D, E → CAMINHO FORMADO

================== CAMINHO INICIANTE (respostas A ou B) ==================

7i. Se A: "Em que escola você estuda e em que ano está?" (escola, ano: 1º/2º/3º,
    turno: manhã/tarde/noite)
    Se B: "Em que escola você concluiu o ensino médio e em que ano?"

8i. Tela de transição (só texto, botão "Beleza, vamos lá"):
    "Agora a parte que todo mundo acha que não tem: experiência. Vamos por partes —
    você provavelmente tem mais do que imagina."

9i. "Você já ajudou em algum negócio da família? Mercadinho, lanchonete, oficina,
    salão, obra, qualquer coisa." (Sim/Não)
    → Se Sim: "O que você fazia lá?" (exemplos abaixo do campo: atendia clientes,
      organizava estoque, fechava caixa, entregava pedidos) + "Quando foi?"
10i. "Você já ganhou dinheiro por conta própria? Freela, venda, delivery, unha,
    cabelo, bolo, conserto, design." (Sim/Não) → "O que você fazia?" + "Quando?"
11i. "Já foi voluntário em alguma coisa? Igreja, ONG, time, campanha, festa do
    bairro." (Sim/Não) → "O que você fazia?" + "Quando?"
12i. "Já teve alguma função na escola? Representante de turma, grêmio, monitoria,
    organizar evento." (Sim/Não) → "Qual função e o que você fazia?"
13i. "Participou de alguma eletiva, projeto ou feira que te orgulha?" (Sim/Não)
    → "Qual foi e o que você fez nela?"
14i. "Já trabalhou registrado ou como aprendiz?" (Sim/Não)
    → empresa, função, período.

    Se TODAS as respostas de 9i a 14i forem "Não", mostre:
    "Tudo bem. Seu currículo vai se apoiar nos seus cursos e nas suas habilidades —
    e isso é completamente normal para quem está começando. Vamos lá."

================== CAMINHO FORMADO (respostas C, D ou E) ==================

7f. SEÇÃO FORMAÇÃO ACADÊMICA — lista dinâmica, botão "Adicionar outra formação".
    Para cada formação, uma pergunta de cada vez:
    - "Qual é o nome do curso?"
    - "Qual é o tipo?" (Técnico / Tecnólogo / Bacharelado / Licenciatura /
      Especialização ou MBA / Mestrado / Doutorado)
    - "Em que instituição?"
    - "Qual é a situação?" (Concluído / Cursando / Trancado ou interrompido)
      → Se Concluído: "Em que ano você concluiu?"
      → Se Cursando: "Qual a previsão de conclusão?"
      → Se Trancado: não pergunte mais nada; o app exibirá apenas como "cursou",
        sem alardear a interrupção.
    Ao terminar cada formação: "Quer adicionar outra formação?" (Sim/Não)

    Ordene as formações da mais alta/recente para a mais antiga no currículo gerado.

8f. "E o ensino médio: em que escola e em que ano você concluiu?"
    (uma tela só, exibido como uma linha no currículo)

9f. Tela de transição: "Agora a sua experiência profissional."

10f. EXPERIÊNCIA PROFISSIONAL — lista dinâmica, "Adicionar outra experiência".
    Para cada uma:
    - "Qual era o cargo ou função?"
    - "Em que empresa ou instituição?"
    - "De quando até quando?" (mês/ano de início e fim, com checkbox "Trabalho aqui
      até hoje")
    - "O que você fazia nesse trabalho?" (texto livre, com o link "Como fica melhor")
    - "Teve algum resultado concreto que você pode citar?" (opcional)
      Dica: "Número, melhoria, projeto entregue. Se não tiver, pule."
    Ao terminar: "Quer adicionar outra experiência?" (Sim/Não)
    Ordene da mais recente para a mais antiga.

11f. "Você tem experiência que não foi emprego formal? Estágio, voluntariado,
    projeto, pesquisa, iniciação científica, trabalho autônomo." (Sim/Não)
    → mesma estrutura da pergunta 10f, em uma seção própria.

12f. Apenas se a resposta 6 foi D ou E:
    "Você tem produção acadêmica relevante? Artigos, publicações, apresentação em
    congresso, TCC ou dissertação que valha citar." (Sim/Não)
    → título, tipo, ano, onde foi publicado/apresentado. Lista dinâmica.

================== DAQUI PARA FRENTE, OS DOIS CAMINHOS SE JUNTAM ==================

15. "Você fez cursos fora da escola ou da faculdade?"
    (Sim/Não → nome, instituição, carga horária, ano; permite vários)
16. "Marque o que você sabe usar:" (grade clicável, múltipla escolha)
    Word / Excel / PowerPoint / Google Docs e Planilhas / Canva / Edição de vídeo /
    Redes sociais / Caixa e pagamentos / Atendimento ao cliente / Estoque /
    Sistemas de gestão (ERP) / Informática básica
    + campo livre: "Sabe fazer mais alguma coisa? Escreve aí."
17. "Você fala outro idioma?" (Sim/Não → idioma + nível: básico, intermediário,
    avançado, fluente; permite vários)

BLOCO FINAL — OBJETIVO (por último, de propósito)
18. "Que tipo de vaga você está procurando?"
    No caminho INICIANTE, as opções são: Jovem aprendiz / Estágio / Atendimento e
    vendas / Administrativo / Área técnica / Ainda não sei.
    No caminho FORMADO, é campo aberto: "Qual cargo ou área você busca?"
19. "Em uma frase: por que uma empresa deveria te chamar?"
    Dica (iniciante): "Não precisa ser bonito, precisa ser verdade. Ex.: 'Tenho
    facilidade com atendimento ao público e aprendo rápido.'"
    Dica (formado): "Puxe a sua formação e o seu tempo de experiência. Ex.:
    'Pedagoga com 6 anos de sala de aula, buscando coordenação pedagógica.'"
    O app monta o texto do Objetivo a partir das respostas 18 e 19 e MOSTRA para a
    pessoa editar antes de seguir.

REVISÃO
20. Exibe o currículo montado, com cada seção editável ao clicar (edição inline,
    sem voltar ao início).
21. "Pronto. Confira e baixe o seu currículo."

================== RECURSO "COMO FICA MELHOR" ==================
Em cada pergunta de texto livre sobre o que a pessoa fazia, um link discreto
"Como fica melhor" abre um painel comparando:
- Fraco: "Ajudei no mercado do meu tio."
  Forte: "Auxiliar no comércio da família (2024-2025) — atendimento a clientes,
  organização de estoque e fechamento de caixa aos sábados."
  Por quê: o segundo mostra o que você fazia de fato.
- Fraco: "Trabalhei como professora."
  Forte: "Professora de Ciências (2021-2026) — turmas de 6º a 9º ano, elaboração
  de material próprio e coordenação de projetos de eletiva."
  Por quê: o segundo mostra o tamanho e o alcance do trabalho.
- Fraco: "Sou proativo, dinâmico e trabalho bem em equipe."
  Forte: "Excel básico, atendimento ao cliente, organização de estoque, Canva."
  Por quê: o primeiro é o que todo mundo escreve; o segundo dá para comprovar.
- Fraco: "Busco uma oportunidade para crescer profissionalmente."
  Forte: "Primeiro emprego como jovem aprendiz em atendimento. Tenho facilidade
  com público e curso de Excel básico."
  Por quê: o segundo diz o que você quer e o que já traz.

O app transforma a resposta em texto de currículo: se a pessoa escreve "atendia os
clientes e organizava o estoque", o currículo exibe "Atendimento a clientes e
organização de estoque". Capitalize e ajuste a pessoa verbal, mas NUNCA invente
informação que não foi dada.

================== EXPORTAR E CONTINUAR DEPOIS ==================
- "Baixar PDF": currículo em A4, gerado no navegador (html2pdf.js ou jsPDF +
  html2canvas). Uma página para o caminho iniciante; até duas para o formado, com
  quebra de página limpa, nunca cortando uma seção ao meio.
- "Salvar rascunho": baixa um .json com as respostas.
- "Carregar rascunho": a pessoa escolhe o .json do próprio aparelho e volta de onde
  parou. Texto de apoio: "O rascunho fica com você, no seu celular ou computador."

================== DESIGN DO CURRÍCULO GERADO ==================
Sóbrio e profissional. Uma coluna; nome em destaque no topo; contatos em linha única
abaixo; seções com título em caixa alta e filete fino. Sem foto, sem ícones
coloridos, sem barrinhas de "nível de habilidade". Preto sobre branco, precisa
imprimir bem em laser monocromática.
Ordem das seções no caminho INICIANTE: Objetivo, Formação, Cursos, Experiências e
atividades, Habilidades, Idiomas.
Ordem no caminho FORMADO: Objetivo, Experiência profissional, Formação acadêmica,
Produção acadêmica (se houver), Cursos, Habilidades, Idiomas.
Seções vazias não aparecem.

================== DESIGN DO APP ==================
Limpo e moderno, paleta sóbria com uma cor de destaque, bastante espaço em branco.
Precisa funcionar muito bem no celular — a maior parte do público vai usar o telefone.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://curiculobrasil.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5ab3f3c1-e05a-4258-b71c-cc378b4f7739).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
