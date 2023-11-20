import { View, Text } from 'react-native'
import React from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';
import ualocal from 'dayjs/locale/uk';
const useData = ({time}) => {
    dayjs.extend(relativeTime);
    dayjs.locale(ualocal)
    const getTime = () => {
        let dateNow = dayjs();
        let passedTime = new Date(time * 1000);
        return dateNow.from(passedTime, true);
    }
    return getTime()
}

export default useData