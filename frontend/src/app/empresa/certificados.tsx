import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../context/theme-context';
import api, { API_URL } from '../../services/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../../context/AuthContext';
import { TextInput } from 'react-native';

const TIPOS_RESIDUO: any = {
    plastico: "Plástico", papel: "Papel", vidro: "Vidro",
    metal: "Metal", eletronico: "Eletrônico", organico: "Orgânico", entulho: "Entulho"
};

export default function CertificadosScreen() {
    const { colors } = useTheme();
    const { token } = useAuth();
    const [certificados, setCertificados] = useState<any[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [baixandoId, setBaixandoId] = useState<number | null>(null);

    const carregarCertificados = useCallback(async () => {
        setCarregando(true);
        try {
            const params: any = {};
            if (dataInicio) params.data_inicio = dataInicio;
            if (dataFim) params.data_fim = dataFim;
            const { data } = await api.get('/certificados', { params });
            const lista = Array.isArray(data) ? data : data?.data || [];
            setCertificados(lista);
        } catch {
            setCertificados([]);
        } finally {
            setCarregando(false);
        }
    }, [dataInicio, dataFim]);

    useEffect(() => {
        carregarCertificados();
    }, [carregarCertificados]);

    const handleDownload = async (id: number) => {
        setBaixandoId(id);
        try {
            const fileUri = FileSystem.documentDirectory + `certificado_${id}.pdf`;
            const url = `${API_URL}/certificados/${id}/download`;

            const downloadRes = await FileSystem.downloadAsync(url, fileUri, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (downloadRes.status === 200) {
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(downloadRes.uri);
                } else {
                    alert('Compartilhamento não disponível neste dispositivo.');
                }
            } else {
                alert('Erro ao baixar certificado.');
            }
        } catch (err) {
            alert('Não foi possível baixar o certificado.');
        } finally {
            setBaixandoId(null);
        }
    };

    const renderCert = ({ item }: any) => (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', color: '#1e40af', fontSize: 16, marginBottom: 4 }}>{item.numero_certificado}</Text>
                <Text style={{ fontSize: 13, color: colors.text }}>Resíduo: {TIPOS_RESIDUO[item.tipo_residuo] || item.tipo_residuo}</Text>
                <Text style={{ fontSize: 13, color: colors.text }}>Peso coletado: {Number(item.peso_coletado)} kg</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 6 }}>Coleta em {new Date(item.data_coleta).toLocaleDateString()}</Text>
            </View>
            <Pressable
                onPress={() => handleDownload(item.id)}
                disabled={baixandoId === item.id}
                style={({ pressed }) => [styles.downloadBtn, { opacity: pressed || baixandoId === item.id ? 0.7 : 1 }]}
            >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>
                    {baixandoId === item.id ? 'Baixando...' : 'Download'}
                </Text>
            </Pressable>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 15 }}><Text style={{ fontSize: 24, color: '#2563eb' }}>←</Text></Pressable>
                <Text style={[styles.headerTitle, { color: '#1e3a8a' }]}>Meus Certificados</Text>
            </View>

            <View style={styles.filterContainer}>
                <Text style={[styles.label, { color: colors.textMuted }]}>FILTRAR POR PERÍODO</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                    <TextInput
                        style={[styles.input, { flex: 1, backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                        placeholder="Data Início (YYYY-MM-DD)"
                        placeholderTextColor={colors.textMuted}
                        value={dataInicio}
                        onChangeText={setDataInicio}
                    />
                    <TextInput
                        style={[styles.input, { flex: 1, backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                        placeholder="Data Fim (YYYY-MM-DD)"
                        placeholderTextColor={colors.textMuted}
                        value={dataFim}
                        onChangeText={setDataFim}
                    />
                </View>
                {(dataInicio || dataFim) ? (
                    <Pressable onPress={() => { setDataInicio(''); setDataFim(''); }} style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                        <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>Limpar Filtro</Text>
                    </Pressable>
                ) : null}
            </View>

            <FlatList
                data={certificados}
                keyExtractor={item => String(item.id)}
                renderItem={renderCert}
                contentContainerStyle={{ padding: 20 }}
                ListEmptyComponent={<Text style={{ color: colors.textMuted, marginTop: 10 }}>{carregando ? 'Carregando...' : 'Nenhum certificado emitido.'}</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    filterContainer: { padding: 20, paddingBottom: 0 },
    label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8 },
    input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 13 },
    card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
    downloadBtn: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }
});
