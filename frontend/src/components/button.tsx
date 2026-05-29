import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTheme } from '../context/theme-context';

// tipos de botões
type ButtonVariant = 'primary' | 'ghost' | 'danger';

// propriedades do botão
type ButtonProps = {
    label: string;
    onPress: () => void;
    variant?: ButtonVariant;
    disabled?: boolean;
    style?: ViewStyle;
};

// componente
export default function Button ({
    label,
    onPress,
    variant = 'primary',
    disabled = false,
    style,
}: ButtonProps) {

    const { colors } = useTheme();

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.base,

                // define o estilo para cada um dos tipos de botões
                // botão principal
                variant === 'primary' && {
                    backgroundColor: pressed
                        ? colors.primaryDark
                        : colors.primary,
                    opacity: disabled ? 0.5 : 1,
                },
                // botão ghost, invisivel
                variant === 'ghost' && {
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderColor: colors.primary,
                    opacity: pressed ? 0.7 : 1,
                },
                // botão de alerta
                variant === 'danger' && {
                    backgroundColor: pressed ? '#b91c1c' : '#ef4444',
                    opacity: disabled ? 0.5 : 1,
                },

                style,

            ]}
        >
        <Text
            style={[
                styles.label,
                {
                    color: variant === 'ghost' ? colors.primary : '#ffffff'
                },
            ]}
        >
            {label}
        </Text>
        </Pressable>
    );

}

const styles = StyleSheet.create({
    base: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});