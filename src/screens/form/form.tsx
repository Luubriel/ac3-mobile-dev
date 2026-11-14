import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GastoProps, STORAGE_KEY } from "@/screens/home/home";

const CATEGORIAS = ["Alimentação", "Transporte", "Lazer", "Outros"];

export const Form = () => {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("Alimentação");
  const [erro, setErro] = useState("");
  const insets = useSafeAreaInsets();

  const salvarGasto = async () => {
    const valorNumerico = Number(valor.replace(",", "."));

    if (!descricao.trim() || !valor.trim() || isNaN(valorNumerico) || valorNumerico <= 0) {
      setErro("Preencha a descrição e um valor maior que zero!");
      return;
    }

    setErro("");

    try {
      const dadosSalvos = await AsyncStorage.getItem(STORAGE_KEY);
      const listaAtual: GastoProps[] = dadosSalvos ? JSON.parse(dadosSalvos) : [];

      const novoGasto: GastoProps = {
        id: Date.now().toString(),
        descricao: descricao.trim(),
        valor: valorNumerico,
        categoria,
      };

      const novaLista = [novoGasto, ...listaAtual];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
      router.back();
    } catch (error) {
      console.error("Erro ao salvar gasto:", error);
      setErro("Não foi possível salvar o gasto. Tente novamente.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.valorBloco}>
          <Text style={styles.valorPergunta}>Quanto você gastou?</Text>
          <View style={styles.valorLinha}>
            <Text style={styles.valorMoeda}>R$</Text>
            <TextInput
              style={styles.valorInput}
              placeholder="0,00"
              placeholderTextColor="#273a4f"
              keyboardType="numeric"
              value={valor}
              onChangeText={(texto) => {
                setValor(texto);
                if (erro) setErro("");
              }}
            />
          </View>
        </View>

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Almoço, Ônibus, Cinema..."
          placeholderTextColor="#4a6075"
          value={descricao}
          onChangeText={(texto) => {
            setDescricao(texto);
            if (erro) setErro("");
          }}
        />

        <Text style={styles.label}>Categoria</Text>
        <View style={styles.categoriasGrade}>
          {CATEGORIAS.map((item) => {
            const selecionada = categoria === item;

            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                style={[styles.categoriaTile, selecionada && styles.categoriaTileAtivo]}
                onPress={() => setCategoria(item)}
              >
                <View
                  style={[
                    styles.categoriaInicial,
                    selecionada && styles.categoriaInicialAtiva,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoriaInicialTexto,
                      selecionada && styles.categoriaInicialTextoAtivo,
                    ]}
                  >
                    {item.charAt(0)}
                  </Text>
                </View>
                <Text
                  style={[styles.categoriaTexto, selecionada && styles.categoriaTextoAtivo]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {erro ? (
          <View style={styles.erroBox}>
            <View style={styles.erroBarra} />
            <Text style={styles.erroTexto}>{erro}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.rodape, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.botaoSalvar}
          activeOpacity={0.85}
          onPress={salvarGasto}
        >
          <Text style={styles.textoBotaoSalvar}>Salvar lançamento</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexGrow: 1,
  },
  valorBloco: {
    alignItems: "center",
    paddingVertical: 32,
    marginBottom: 8,
  },
  valorPergunta: {
    color: "#6c8791",
    fontSize: 14,
    marginBottom: 8,
  },
  valorLinha: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#39c5bb",
    paddingHorizontal: 8,
  },
  valorMoeda: {
    color: "#86cecb",
    fontSize: 24,
    fontWeight: "600",
    marginRight: 6,
  },
  valorInput: {
    color: "#e6f7f6",
    fontSize: 48,
    fontWeight: "800",
    minWidth: 140,
    textAlign: "center",
    paddingVertical: 4,
  },
  label: {
    color: "#6c8791",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    color: "#e6f7f6",
    fontSize: 17,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#273a4f",
  },
  categoriasGrade: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  categoriaTile: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#161f2c",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  categoriaTileAtivo: {
    backgroundColor: "#112b32",
    borderColor: "#39c5bb",
  },
  categoriaInicial: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#1a2433",
    alignItems: "center",
    justifyContent: "center",
  },
  categoriaInicialAtiva: {
    backgroundColor: "#39c5bb",
  },
  categoriaInicialTexto: {
    color: "#86cecb",
    fontSize: 15,
    fontWeight: "700",
  },
  categoriaInicialTextoAtivo: {
    color: "#0d1117",
  },
  categoriaTexto: {
    color: "#86cecb",
    fontSize: 14,
    flexShrink: 1,
  },
  categoriaTextoAtivo: {
    color: "#e6f7f6",
    fontWeight: "700",
  },
  erroBox: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 24,
    backgroundColor: "rgba(255, 42, 133, 0.08)",
    borderRadius: 8,
    overflow: "hidden",
  },
  erroBarra: {
    width: 4,
    backgroundColor: "#ff2a85",
  },
  erroTexto: {
    flex: 1,
    color: "#ff7eb6",
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  rodape: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#1a2433",
    backgroundColor: "#0d1117",
  },
  botaoSalvar: {
    backgroundColor: "#39c5bb",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  textoBotaoSalvar: {
    color: "#0d1117",
    fontSize: 16,
    fontWeight: "700",
  },
});
