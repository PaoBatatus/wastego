import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/theme-context';
import Button from './button';

// propriedades do alerta
type AlertBoxProps = {
    title: string;
    message: string;
    onClose: () => void;
    // variavel para sucesso ou erro (o alerta serve para os dois)
    variant?: 'success' | 'error';
};

export default function AlertBox({ 
    title, 
    message, 
    onClose, 
    variant = 'success' 
}: AlertBoxProps) {

    // cores do tema
    const { colors } = useTheme();

    return (
        <View style={[
            styles.container, 
            { 
                backgroundColor: colors.surface,
                // se for sucesso, usa cor padrão, em erro usa vermelho
                borderColor: variant === 'success' ? colors.primary : '#ef4444'
            }
        ]}>
            <Text style={[styles.title, { color: colors.text }]}>
                {title}
            </Text>
            
            <Text style={[styles.message, { color: colors.textMuted }]}>
                {message}
            </Text>
            
            <View style={styles.buttonContainer}>
                <Button 
                    label="OK" 
                    onPress={onClose} 
                    // cor em caso de sucesso ou erro
                    variant={variant === 'success' ? 'primary' : 'danger'} 
                />
            </View>
        </View>
    );
}

// estilização
const styles = StyleSheet.create({
    container: {
        borderWidth: 2,
        borderRadius: 12,
        padding: 20,
        marginVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    buttonContainer: {
        width: '100%',
        marginTop: 8,
    }
});