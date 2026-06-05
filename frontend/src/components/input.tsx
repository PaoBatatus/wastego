import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../context/theme-context';

// propriedades do input
type InputProps = {
    label: string;
    value: string;
    // função que aviza se o texto foi alterado
    onChangeText: (text: string) => void;
    
    // texto que aparece quando nao tem nada escrito pelo usuario
    placeholder?: string;
    // pontinho na senha
    secureTextEntry?: boolean;
    // qual teclado vai ser aberto
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    // mensagem de erro que seria exibida
    errorMessage?: string;
    // auto capitalização do teclado
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export default function Input ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
    errorMessage,
    autoCapitalize,
}: InputProps) {

    // cores do tema
    const { colors } = useTheme();

    return (
        <View style={styles.wrapper}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
                {label.toUpperCase()}
            </Text>
            <TextInput
                value = {value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    // Adicionando borda vermelha caso haja erro
                    borderColor: errorMessage ? '#ef4444' : colors.border,
                    color: colors.text
                  }  
                ]}
            />
            {/* mensagem de erro */}
            {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
        </View>
    );
}

// estilização
const styles = StyleSheet.create({
    wrapper: { 
        marginBottom: 14 
    },
    label: { 
        fontSize: 11, 
        fontWeight: '600', 
        letterSpacing: 0.8, 
        marginBottom: 6 
    },
    input: { 
        borderWidth: 1.5, 
        borderRadius: 12, 
        padding: 14, 
        fontSize: 15 
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
        marginLeft: 4,
    }
});