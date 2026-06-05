import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, Modal } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../context/theme-context';
import api from '../../services/api';

const CATEGORIAS: any = {
    descarte_irregular: 'Descarte irregular',
    lixo_via_publica: 'Lixo em via pública',
    entulho: 'Entulho',
    poda_fora_calendario: 'Poda fora do calendário',
    outro: 'Outro',
};

const STATUS_CONFIG: any = {
    recebida: { label: 'Recebida', bg: '#f3f4f6', text: '#374151' },
    em_analise: { label: 'Em análise', bg: '#fef9c3', text: '#854d0e' },
    resolvida: { label: 'Resolvida', bg: '#dcfce7', text: '#166534' },
    cancelada: { label: 'Cancelada', bg: '#fee2e2', text: '#991b1b' },
};

export default function GestorDenunciasScreen() {
    const { colors } = useTheme();
    const [denuncias, setDenuncias] = useState<any[]>([]);
    const [carregando, setCarregando] = useState(true);

    const [filtroStatus, setFiltroStatus] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [isDropdownStatus, setIsDropdownStatus] = useState(false);
    const [isDropdownCat, setIsDropdownCat] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDenuncia, setSelectedDenuncia] = useState<number | null>(null);
    const [updating, setUpdating] = useState(false);

    const carregarDenuncias = useCallback(async () => {
        setCarregando(true);
        try {
            const { data } = await api.get('/denuncias');
            const lista = data?.data?.data || data?.data || data || [];
            setDenuncias(Array.isArray(lista) ? lista : []);
        } catch {
            setDenuncias([]);
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarDenuncias();
    }, [carregarDenuncias]);

    const denunciasFiltradas = useMemo(() => {
        let result = denuncias;
        if (filtroStatus) result = result.filter(d => d.status === filtroStatus);
        if (filtroCategoria) result = result.filter(d => d.categoria === filtroCategoria);
        return result;
    }, [denuncias, filtroStatus, filtroCategoria]);

    const openStatusModal = (id: number) => {
        setSelectedDenuncia(id);
        setModalVisible(true);
    };

    const handleUpdateStatus = async (novo: string) => {
        if (!selectedDenuncia) return;
        setUpdating(true);
        try {
            await api.put(`/denuncias/${selectedDenuncia}/status`, { status: novo });
            carregarDenuncias();
            setModalVisible(false);
        } catch {
            alert('Erro ao atualizar status');
        } finally {
            setUpdating(false);
        }
    };

    const renderDenuncia = ({ item }: any) => {
        const conf = STATUS_CONFIG[item.status] || { label: item.status, bg: '#eee', text: '#000' };
        return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ fontWeight: 'bold', color: '#9333ea', fontSize: 14 }}>
                        #{item.id} - {CATEGORIAS[item.categoria] || item.categoria}
                    </Text>
                    <View style={{ backgroundColor: conf.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                        <Text style={{ color: conf.text, fontSize: 10, fontWeight: 'bold' }}>{conf.label}</Text>
                    </View>
                </View>
                <Text style={{ fontSize: 13, color: colors.text, marginTop: 8 }} numberOfLines={3}>{item.descricao}</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 8 }}>Criado em: {new Date(item.created_at).toLocaleDateString()}</Text>
                
                <Pressable 
                    onPress={() => openStatusModal(item.id)}
                    style={({ pressed }) => [styles.btnAcao, { opacity: pressed ? 0.7 : 1 }]}
                >
                    <Text style={{ color: '#9333ea', fontWeight: '600', fontSize: 13 }}>Atualizar Status ➔</Text>
                </Pressable>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 15 }}><Text style={{ fontSize: 24, color: '#9333ea' }}>←</Text></Pressable>
                <Text style={[styles.headerTitle, { color: '#6b21a8' }]}>Gestão de Denúncias</Text>
            </View>

            <View style={styles.filterContainer}>
                <View style={{ flexDirection: 'row', gap: 10, zIndex: 20 }}>
                    <View style={{ flex: 1, zIndex: 20 }}>
                        <Pressable onPress={() => setIsDropdownStatus(!isDropdownStatus)} style={[styles.dropdownHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={{ color: colors.text, fontSize: 12 }}>{filtroStatus ? STATUS_CONFIG[filtroStatus]?.label : 'Todos os status'}</Text>
                        </Pressable>
                        {isDropdownStatus && (
                            <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Pressable onPress={() => { setFiltroStatus(''); setIsDropdownStatus(false); }} style={styles.dropdownItem}><Text style={{ color: colors.text }}>Todos</Text></Pressable>
                                {Object.keys(STATUS_CONFIG).map(k => (
                                    <Pressable key={k} onPress={() => { setFiltroStatus(k); setIsDropdownStatus(false); }} style={styles.dropdownItem}>
                                        <Text style={{ color: colors.text }}>{STATUS_CONFIG[k].label}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>
                    <View style={{ flex: 1, zIndex: 10 }}>
                        <Pressable onPress={() => setIsDropdownCat(!isDropdownCat)} style={[styles.dropdownHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={{ color: colors.text, fontSize: 12 }}>{filtroCategoria ? CATEGORIAS[filtroCategoria] : 'Todas as categorias'}</Text>
                        </Pressable>
                        {isDropdownCat && (
                            <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Pressable onPress={() => { setFiltroCategoria(''); setIsDropdownCat(false); }} style={styles.dropdownItem}><Text style={{ color: colors.text }}>Todas</Text></Pressable>
                                {Object.keys(CATEGORIAS).map(k => (
                                    <Pressable key={k} onPress={() => { setFiltroCategoria(k); setIsDropdownCat(false); }} style={styles.dropdownItem}>
                                        <Text style={{ color: colors.text }}>{CATEGORIAS[k]}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <FlatList
                data={denunciasFiltradas}
                keyExtractor={item => String(item.id)}
                renderItem={renderDenuncia}
                contentContainerStyle={{ padding: 20 }}
                ListEmptyComponent={<Text style={{ color: colors.textMuted, marginTop: 10 }}>{carregando ? 'Carregando...' : 'Nenhuma denúncia encontrada.'}</Text>}
            />

            <Modal visible={modalVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Atualizar Status</Text>
                        {updating ? (
                            <Text style={{ textAlign: 'center', marginVertical: 20, color: colors.primary }}>Atualizando...</Text>
                        ) : (
                            <>
                                {Object.keys(STATUS_CONFIG).map(k => (
                                    <Pressable 
                                        key={k} 
                                        onPress={() => handleUpdateStatus(k)}
                                        style={[styles.modalItem, { borderColor: colors.border }]}
                                    >
                                        <Text style={{ color: colors.text }}>{STATUS_CONFIG[k].label}</Text>
                                    </Pressable>
                                ))}
                                <Pressable onPress={() => setModalVisible(false)} style={styles.modalCancel}>
                                    <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Cancelar</Text>
                                </Pressable>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    filterContainer: { paddingHorizontal: 20, paddingTop: 16, zIndex: 10 },
    dropdownHeader: { padding: 12, borderWidth: 1, borderRadius: 8, justifyContent: 'center' },
    dropdownList: { position: 'absolute', top: 45, left: 0, right: 0, borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
    dropdownItem: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
    card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
    btnAcao: { marginTop: 12, paddingVertical: 8, alignItems: 'flex-start' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', borderRadius: 12, borderWidth: 1, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    modalItem: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
    modalCancel: { marginTop: 16, alignItems: 'center', paddingVertical: 10 }
});
