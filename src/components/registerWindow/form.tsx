import React, { useRef, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { useAppSelector } from '../../hooks';
import { theme } from '../../constants/theme';
import Icon from '../icon';
import { Input } from 'react-native-elements';

const IconButton = ({ iconName, onPress }: { iconName: string; onPress: () => void }) => (
  <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
    <Icon name={iconName} size={28} style={{ marginHorizontal: 15 }} />
  </TouchableOpacity>
);

const Form = () => {
  const themeState = useAppSelector(state => state.theme);
  const [values, setValues] = useState<{ email: null | string; password: null | string }>({ email: null, password: null });
  const [showPassword, setShowPassword] = useState(true);
  const password = useRef();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={styles.form}>
            <Input
              inputContainerStyle={{ maxHeight: 40 }}
              containerStyle={[styles.input, { borderColor: theme.colors.brandGrey }]}
              onChangeText={v => setValues({ ...values, email: v })}
              value={values.email}
              placeholder="E-mail"
              autoFocus={false}
              placeholderTextColor={theme.colors.brandGrey}
              style={{
                color: themeState.themeColor.color,
                fontSize: 14,
                fontFamily: theme.fonts.halyardRegular,
              }}
              autoCompleteType="email"
              autoCapitalize="none"
              editable={true}
              blurOnSubmit={false}
              secureTextEntry={false}
              returnKeyType="next"
              keyboardType="email-address"
              onSubmitEditing={() => password.current.focus()}
              rightIcon={
                values.email ? (
                  <Pressable accessibilityLabel={'Apagar'} onPress={() => setValues({ ...values, email: null })}>
                    <Icon name={'close'} size={14} disableFill={false} color={themeState.themeColor.color} fill={themeState.themeColor.color} />
                  </Pressable>
                ) : (
                  <View />
                )
              }
              clearButtonMode="never"
            />
            <Input
              ref={password}
              inputContainerStyle={{ maxHeight: 40 }}
              containerStyle={[styles.input, { borderColor: theme.colors.brandGrey }]}
              style={{
                color: themeState.themeColor.color,
                fontSize: 14,
                fontFamily: theme.fonts.halyardRegular,
              }}
              onChangeText={v => setValues({ ...values, password: v })}
              value={values.password}
              placeholder="Palavra-passe"
              placeholderTextColor={theme.colors.brandGrey}
              autoCompleteType="password"
              editable={true}
              blurOnSubmit={true}
              secureTextEntry={showPassword}
              returnKeyType="done"
              keyboardType="default"
              rightIcon={
                <Pressable accessibilityLabel={'Mostrar/Esconder Password'} onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? 'eye-off' : 'eye'} size={14} disableFill={false} color={theme.colors.brandGrey} fill={theme.colors.brandGrey} />
                </Pressable>
              }
              clearButtonMode="never"
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            <IconButton iconName="facebook" onPress={() => {}} />
            <IconButton iconName="google" onPress={() => {}} />
            <IconButton iconName="apple" onPress={() => {}} />
          </View>
          <View style={{ marginTop: 30, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 16,
                width: 149,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 14, lineHeight: 24, color: theme.colors.brandBlack, fontFamily: theme.fonts.halyardRegular }}>Iniciar sessão</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              style={{
                backgroundColor: theme.colors.brandBlue,
                borderRadius: 16,
                width: 149,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 14, lineHeight: 24, color: theme.colors.white, fontFamily: theme.fonts.halyardRegular }}>Criar conta gratuita</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 30 }}>
          <Text style={{ fontSize: 14, lineHeight: 24, color: theme.colors.brandBlue, fontFamily: theme.fonts.halyardRegular }}>
            Esqueceu-se da palavra-passe?
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {}}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 99,
            alignItems: 'center',
            paddingVertical: 10,
            borderTopWidth: 1,
            borderColor: theme.colors.mediumGrey,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              lineHeight: 24,
              color: theme.colors.brandGrey,
              fontFamily: theme.fonts.halyardRegular,
            }}
          >
            Lembrar mais tarde
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  form: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 25,
  },
  input: {
    height: 40,
    marginBottom: 20,
  },
});

export default Form;
