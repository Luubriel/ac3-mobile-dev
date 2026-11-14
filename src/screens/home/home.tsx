import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type GastoProps = {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
};

export const STORAGE_KEY = "@gastos_app";

// Cores usadas na barra de distribuição por categoria
const CORES_CATEGORIA: Record<string, string> = {
  Alimentação: "#39c5bb",
  Transporte: "#86cecb",
  Lazer: "#ff2a85",
  Outros: "#4a6075",
};

const corDaCategoria = (categoria: string) => CORES_CATEGORIA[categoria] ?? "#4a6075";

export const Home = () => {
  const [gastos, setGastos] = useState<GastoProps[]>([]);
  const insets = useSafeAreaInsets();

  const carregarGastos = async () => {
    try {
      const dadosSalvos = await AsyncStorage.getItem(STORAGE_KEY);
      if (dadosSalvos) {
        setGastos(JSON.parse(dadosSalvos));
      } else {
        setGastos([]);
      }
    } catch (error) {
      console.error("Erro ao carregar gastos:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarGastos();
    }, [])
  );

  const excluirGasto = async (id: string) => {
    try {
      const novaLista = gastos.filter((item) => item.id !== id);
      setGastos(novaLista);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
    } catch (error) {
      console.error("Erro ao excluir gasto:", error);
    }
  };

  const limparTudo = async () => {
    try {
      setGastos([]);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch (error) {
      console.error("Erro ao limpar gastos:", error);
    }
  };

  const total = gastos.reduce((acc, item) => acc + item.valor, 0);
  const quantidadeAcima100 = gastos.filter((item) => item.valor > 100).length;

  const totaisPorCategoria = gastos.reduce<Record<string, number>>((acc, item) => {
    acc[item.categoria] = (acc[item.categoria] ?? 0) + item.valor;
    return acc;
  }, {});
  const categoriasOrdenadas = Object.entries(totaisPorCategoria).sort((a, b) => b[1] - a[1]);

  const [inteiro, centavos] = total.toFixed(2).split(".");

  const cabecalho = (
    <View style={styles.hero}>
      <View style={styles.topoLinha}>
        <Text style={styles.saudacao}>Controle de Gastos</Text>
        {gastos.length > 0 && (
          <TouchableOpacity style={styles.botaoLimpar} onPress={limparTudo}>
            <Text style={styles.textoBotaoLimpar}>Limpar tudo</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.totalLabel}>Total gasto</Text>
      <View style={styles.totalLinha}>
        <Text style={styles.totalMoeda}>R$</Text>
        <Text style={styles.totalInteiro}>{inteiro}</Text>
        <Text style={styles.totalCentavos}>,{centavos}</Text>
      </View>

      <View style={styles.statsLinha}>
        <View style={styles.statItem}>
          <Text style={styles.statNumero}>{gastos.length}</Text>
          <Text style={styles.statLabel}>
            {gastos.length === 1 ? "lançamento" : "lançamentos"}
          </Text>
        </View>
        <View style={styles.statDivisor} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumero, quantidadeAcima100 > 0 && styles.statNumeroDestaque]}>
            {quantidadeAcima100}
          </Text>
          <Text style={styles.statLabel}>acima de R$ 100</Text>
        </View>
      </View>

      {categoriasOrdenadas.length > 0 && (
        <View style={styles.distribuicao}>
          <View style={styles.barra}>
            {categoriasOrdenadas.map(([categoria, valor]) => (
              <View
                key={categoria}
                style={{ flex: valor, backgroundColor: corDaCategoria(categoria) }}
              />
            ))}
          </View>
          <View style={styles.legenda}>
            {categoriasOrdenadas.map(([categoria, valor]) => (
              <View key={categoria} style={styles.legendaItem}>
                <View style={[styles.legendaPonto, { backgroundColor: corDaCategoria(categoria) }]} />
                <Text style={styles.legendaTexto}>
                  {categoria} · {Math.round((valor / total) * 100)}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Text style={styles.secaoTitulo}>Histórico</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={gastos}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 110 }]}
        ListHeaderComponent={cabecalho}
        ItemSeparatorComponent={() => <View style={styles.separador} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcone}>
              <Text style={styles.emptyIconeTexto}>R$</Text>
            </View>
            <Text style={styles.emptyTitulo}>Nada por aqui ainda</Text>
            <Text style={styles.emptyText}>
              Toque em &quot;Novo gasto&quot; para registrar seu primeiro lançamento.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const acimaDe100 = item.valor > 100;

          return (
            <View style={styles.item}>
              <View
                style={[
                  styles.avatar,
                  { borderColor: corDaCategoria(item.categoria) },
                  acimaDe100 && styles.avatarDestaque,
                ]}
              >
                <Text style={[styles.avatarTexto, { color: corDaCategoria(item.categoria) }]}>
                  {item.categoria.charAt(0)}
                </Text>
              </View>

              <View style={styles.itemInfo}>
                <Text style={styles.descricao} numberOfLines={1}>
                  {item.descricao}
                </Text>
                <Text style={styles.subtitulo}>
                  {item.categoria}
                  {acimaDe100 && <Text style={styles.destaqueTag}>  ▲ gasto alto</Text>}
                </Text>
              </View>

              <View style={styles.itemDireita}>
                <Text style={[styles.valor, acimaDe100 && styles.valorDestaque]}>
                  - R$ {item.valor.toFixed(2)}
                </Text>
                <TouchableOpacity
                  onPress={() => excluirGasto(item.id)}
                  hitSlop={8}
                >
                  <Text style={styles.textoExcluir}>remover</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        activeOpacity={0.85}
        onPress={() => router.navigate("/form")}
      >
        <Text style={styles.fabIcone}>+</Text>
        <Text style={styles.fabTexto}>Novo gasto</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  hero: {
    paddingTop: 20,
  },
  topoLinha: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  saudacao: {
    color: "#e6f7f6",
    fontSize: 20,
    fontWeight: "700",
  },
  botaoLimpar: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255, 42, 133, 0.12)",
  },
  textoBotaoLimpar: {
    color: "#ff2a85",
    fontSize: 12,
    fontWeight: "600",
  },
  totalLabel: {
    color: "#6c8791",
    fontSize: 14,
  },
  totalLinha: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 4,
  },
  totalMoeda: {
    color: "#86cecb",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    marginRight: 6,
  },
  totalInteiro: {
    color: "#e6f7f6",
    fontSize: 52,
    fontWeight: "800",
    letterSpacing: -1,
  },
  totalCentavos: {
    color: "#39c5bb",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 9,
  },
  statsLinha: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#273a4f",
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  statDivisor: {
    width: StyleSheet.hairlineWidth,
    height: 20,
    backgroundColor: "#273a4f",
    marginHorizontal: 16,
  },
  statNumero: {
    color: "#39c5bb",
    fontSize: 18,
    fontWeight: "700",
  },
  statNumeroDestaque: {
    color: "#ff2a85",
  },
  statLabel: {
    color: "#6c8791",
    fontSize: 13,
  },
  distribuicao: {
    marginTop: 20,
  },
  barra: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    gap: 2,
    backgroundColor: "#161f2c",
  },
  legenda: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 14,
    rowGap: 6,
    marginTop: 10,
  },
  legendaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendaPonto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendaTexto: {
    color: "#86cecb",
    fontSize: 12,
  },
  secaoTitulo: {
    color: "#6c8791",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 32,
    marginBottom: 8,
  },
  separador: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#1a2433",
    marginLeft: 58,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    backgroundColor: "#161f2c",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarDestaque: {
    backgroundColor: "#2b1429",
  },
  avatarTexto: {
    fontSize: 17,
    fontWeight: "700",
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  descricao: {
    color: "#e6f7f6",
    fontSize: 16,
    fontWeight: "600",
  },
  subtitulo: {
    color: "#6c8791",
    fontSize: 13,
    marginTop: 3,
  },
  destaqueTag: {
    color: "#ff2a85",
    fontSize: 12,
    fontWeight: "600",
  },
  itemDireita: {
    alignItems: "flex-end",
    gap: 4,
  },
  valor: {
    color: "#e6f7f6",
    fontSize: 16,
    fontWeight: "700",
  },
  valorDestaque: {
    color: "#ff7eb6",
  },
  textoExcluir: {
    color: "#6c8791",
    fontSize: 12,
    textDecorationLine: "underline",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  emptyIcone: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "#273a4f",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyIconeTexto: {
    color: "#39c5bb",
    fontSize: 20,
    fontWeight: "700",
  },
  emptyTitulo: {
    color: "#e6f7f6",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 6,
  },
  emptyText: {
    color: "#6c8791",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#39c5bb",
    paddingVertical: 14,
    paddingLeft: 18,
    paddingRight: 22,
    borderRadius: 999,
    shadowColor: "#39c5bb",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabIcone: {
    color: "#0d1117",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 22,
  },
  fabTexto: {
    color: "#0d1117",
    fontSize: 15,
    fontWeight: "700",
  },
});
