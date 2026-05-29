import React, { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { Text, View, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/theme-context';
import { useAuth } from '../../context/AuthContext';

export default function EmpresaLayout() {
  const { colors } = useTheme();
  const { usuario, carregando } = useAuth();

  useEffect(() => {
    if (!carregando) {
      if (!usuario || usuario.perfil !== 'empresa') {
        router.replace('/');
      }
    }
  }, [usuario, carregando]);

  if (carregando || !usuario || usuario.perfil !== 'empresa') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Tabs 
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: colors.surface, 
          borderTopColor: colors.border,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          paddingBottom: 5,
          height: 60
        },
        tabBarActiveTintColor: '#2563eb', // Blue theme for Empresa
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' }
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Início', 
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>🏢</Text> 
        }} 
      />
      <Tabs.Screen 
        name="anunciar" 
        options={{ 
          title: 'Anunciar Lote', 
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>📦</Text> 
        }} 
      />
      <Tabs.Screen 
        name="certificados" 
        options={{ 
          title: 'Certificados', 
          tabBarIcon: ({ focused }) => <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>📜</Text> 
        }} 
      />
    </Tabs>
  );
}
