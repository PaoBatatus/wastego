import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { View, Modal, StyleSheet, Text, Pressable, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from './theme-context';
import Button from '../components/button';

interface LocationContextData {
    requestConfirmedLocation: () => Promise<Location.LocationObject>;
}

const LocationContext = createContext<LocationContextData>({} as LocationContextData);

export const useLocationConfirmation = () => {
    return useContext(LocationContext);
};

export const LocationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const { colors } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    const [region, setRegion] = useState<Region | null>(null);
    const resolvePromise = useRef<((value: Location.LocationObject) => void) | null>(null);
    const rejectPromise = useRef<((reason?: any) => void) | null>(null);

    const requestConfirmedLocation = useCallback(async (): Promise<Location.LocationObject> => {
        return new Promise(async (resolve, reject) => {
            try {
                setLoading(true);
                setErrorMsg('');
                
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setLoading(false);
                    reject(new Error('Permissão de localização negada.'));
                    return;
                }

                let location = await Location.getCurrentPositionAsync({});
                setRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
                
                resolvePromise.current = resolve;
                rejectPromise.current = reject;
                
                setModalVisible(true);
            } catch (err) {
                reject(err);
            } finally {
                setLoading(false);
            }
        });
    }, []);

    const handleConfirm = () => {
        if (region && resolvePromise.current) {
            const confirmedLocation: any = {
                coords: {
                    latitude: region.latitude,
                    longitude: region.longitude,
                }
            };
            resolvePromise.current(confirmedLocation);
            
            setModalVisible(false);
            resolvePromise.current = null;
            rejectPromise.current = null;
        }
    };

    const handleCancel = () => {
        if (rejectPromise.current) {
            rejectPromise.current(new Error('Confirmação de localização cancelada.'));
        }
        setModalVisible(false);
        resolvePromise.current = null;
        rejectPromise.current = null;
    };

    return (
        <LocationContext.Provider value={{ requestConfirmedLocation }}>
            {children}
            
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.overlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <Text style={[styles.title, { color: colors.text }]}>Confirme sua Localização</Text>
                        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Arraste o mapa para ajustar o pino no local exato.</Text>
                        
                        {region ? (
                            <View style={styles.mapContainer}>
                                <MapView
                                    style={styles.map}
                                    initialRegion={region}
                                    onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
                                >
                                </MapView>
                                <View style={styles.centerMarker} pointerEvents="none">
                                    <Text style={{ fontSize: 40 }}>📍</Text>
                                </View>
                            </View>
                        ) : (
                            <ActivityIndicator size="large" color={colors.primary} />
                        )}

                        <View style={styles.buttonRow}>
                            <Pressable 
                                onPress={handleCancel} 
                                style={[styles.cancelBtn, { borderColor: colors.border }]}
                            >
                                <Text style={[styles.cancelText, { color: colors.text }]}>Cancelar</Text>
                            </Pressable>
                            <Button 
                                label="Confirmar Local" 
                                onPress={handleConfirm} 
                                style={styles.confirmBtn} 
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </LocationContext.Provider>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '80%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 20,
    },
    mapContainer: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        position: 'relative',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    centerMarker: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -20,
        marginTop: -40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        paddingBottom: 20,
    },
    cancelBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        fontWeight: '600',
        fontSize: 15,
    },
    confirmBtn: {
        flex: 2,
        margin: 0,
    }
});
