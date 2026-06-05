import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../context/theme-context';

// propriedades do card
type CardProps = {
    children: ReactNode;
    style?: ViewStyle;
};

// componente
export default function Card({ children, style }: CardProps) {
    
    // cores do tema
    const { colors } = useTheme();

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}

// estilização
const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
});
