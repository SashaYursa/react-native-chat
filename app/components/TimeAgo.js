import { View, Text } from 'react-native'
import React, { memo } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';
import ualocal from 'dayjs/locale/uk';
const TimeAgo = memo(({date, styleProps, textAfter}) => {
    console.log('time rerender',String(date).length)
    dayjs.extend(relativeTime);
    dayjs.locale(ualocal)
    const getTime = (time) => {
        let dateNow = dayjs();
        let passedTime = new Date(String(date).length === 10 ? time * 1000 : time);
        return dateNow.from(passedTime, true);
    }
    const time = getTime(date);
  return (
    <Text style={styleProps}>{time} {textAfter}</Text>
  )
})

export default TimeAgo