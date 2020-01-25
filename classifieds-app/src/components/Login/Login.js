import React from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import TextInput from '~/components/shared/TextInput';

const Lable = styled.label`
  display: block;

  :not(:first-child) {
    margin-top: 0.75rem;
  }
`;

const LableText = styled.strong`
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const LoginButton = styled.button`
  display: inline-block;
  margin-top: 0.5rem;
`;

const Login = () => {
  const {
    formState: { isSumbitting },
    handleSubmit,
    register,
  } = useForm();

  const onSubmit = handleSubmit(({ email, password }) => {
    console.log(email, password);
  });

  return (
    <form onSubmit={onSubmit}>
      <Lable>
        <LableText>Email</LableText>
        <TextInput disable={isSumbitting} name="email" type="email" ref={register} />
      </Lable>
      <Lable>
        <LableText>Password</LableText>
        <TextInput disable={isSumbitting} name="password" type="password" ref={register} />
        <LoginButton disable={isSumbitting} type="submit">
          Login
        </LoginButton>
      </Lable>
    </form>
  );
};

export default Login;
