# react-native-chat
simple react native chat app
## workflow:
> chat screen: 
>> 1. - Завантаження даних чату по айді чату - (користувачі, тип чату, ім'я чату), встановлюється в змінну - chatData.
>> 2. - Завантаження користувачів чату - (ім'я, пошта, айді, фото, час останнього оновлення статусу, статус), встановлюється в змінну - chatUsers.
>> 3. - Завантаження 50 останніх повідомлень чату по айді чату - (дата створення, текст, айді користувача який створив) → додається (айді повідомлення(ключ повідомлення), чи повідомлення є вибрано, фото користувача(береться по айді користувача з змінної chatUsers), встановлюється в змінну - messages.
>>    - Встановлення даних про співрозмовника в хедері чату.
>> 4. - Отримання онлайн статусу користувача чату -> оновлює поля в змінній chatUsers (onlineStatus, lastSeen) , стежить за даними з realtime database, при від'єднанні спрацьовує колбек, який оновлює поля status і lastSeen.
		   
