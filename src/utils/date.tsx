import React from 'react';
import { Text } from 'react-native';
import moment from 'moment';
import 'moment/locale/pt';

moment.locale('pt');
moment.updateLocale('pt', {
  months: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
});

const Date = (date: string) => {
  const postDate = moment(date);
  const nowDate = moment();
  const diffDate = nowDate.diff(postDate, 'seconds');
  return { postDate, nowDate, diffDate };
};

export const getDate = (date: string) => {
  const { postDate, nowDate, diffDate } = Date(date);
  if (diffDate < 300) {
    return `Agora`;
  }
  if (diffDate < 60) {
    return (
      <Text>
        Há {diffDate}
        <Text accessibilityLabel={'segundos'} accessibilityHint={'unidade de tempo'}>
          s
        </Text>
      </Text>
    );
  }
  if (diffDate < 3600) {
    return (
      <Text>
        Há {Math.floor(diffDate / 60)}
        <Text accessibilityLabel={'minutos'} accessibilityHint={'unidade de tempo'}>
          m
        </Text>
      </Text>
    );
  }
  if (diffDate < 3600 * 6) {
    return (
      <Text>
        Há {Math.floor(diffDate / 3600)}
        <Text accessibilityLabel={'horas'} accessibilityHint={'unidade de tempo'}>
          h
        </Text>
      </Text>
    );
  }
  if (diffDate < 3600 * 24 && nowDate.day() === postDate.day()) {
    return `Hoje`;
  }
  if (diffDate < 3600 * 48 && nowDate.day() === postDate.day() + 1) {
    return `Ontem`;
  }
  return `${postDate.format('D [de] MMMM')}`;
};

export const getDateHour = (date: string) => {
  const { postDate } = Date(date);
  const dateString = postDate.format('D [de] MMMM');
  return `${dateString} às ${postDate.format('HH[:]mm')}`;
};
