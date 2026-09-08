# Capítulo 29: Arquitetura Embarcada Limpa

## Core Idea
No desenvolvimento de sistemas embarcados e IoT, engenheiros frequentemente cometem o erro de amarrar o software à placa de circuito. A arquitetura limpa embarcada estabelece a separação clara entre três mundos: **Software**, **Firmware** e **Hardware**.

## Frameworks Introduced
- **O Teste de App-tidão (App-titude Test)**:
  - Escrever código que apenas "funciona na placa" é passar no teste de aptidão básico.
  - A verdadeira engenharia de software garante que o código seja limpo, testável fora do dispositivo físico e capaz de sobreviver à troca do microcontrolador ou do fabricante de hardware.
- **A Tríade de Camadas Embarcadas**:
  1. *Hardware*: O silício, barramentos, sensores e processadores físicos.
  2. *Firmware*: O código que fala diretamente com os registradores do hardware (drivers de dispositivo, BSP).
  3. *Software*: As regras de negócio que controlam o equipamento, completamente independentes de hardware.
- **HAL (Hardware Abstraction Layer) e OSAL (Operating System Abstraction Layer)**:
  - O Software acessa o Hardware estritamente através de uma camada HAL.
  - Isso permite que 100% da lógica da aplicação seja compilada e testada no computador do desenvolvedor (x86/Mac) em microssegundos, sem precisar do dispositivo físico ou emulador lento.

## Key Concepts
- **Firmware vs Software**: Firmware é o software que depende de hardware específico; software é o código puro que não conhece o silício.
- **HAL (Camada de Abstração de Hardware)**: Fronteira limpa que isola o domínio do hardware físico.

## Mental Models
- **O Piloto Automático do Avião**: A lógica de navegação matemática calcula ângulos e rotas; ela não precisa saber se o atuador físico da asa é elétrico ou hidráulico.

## Anti-patterns
- **Polvilhar Leitura de Registradores no Domínio**: Espalhar comandos como `outp(0x3F8, byte)` dentro das rotinas que calculam a telemetria do sistema.
