export const tabuleiroVazio = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];

export function marcar(tabuleiro, linha, coluna, jogador) {
  if (tabuleiro[linha][coluna] === "") {
    const novoTabuleiro = tabuleiro.map((row) => row.slice());
    novoTabuleiro[linha][coluna] = jogador;
    return novoTabuleiro;
  }
  return tabuleiro;
}