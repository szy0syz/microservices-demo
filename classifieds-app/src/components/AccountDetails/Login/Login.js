import React from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';

import { setSession } from '#root/store/ducks/session';
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

const OrSignUp = styled.span`
  font-size: 0.9rem;
`;

const mutation = gql`
  mutation($email: String!, $password: String!) {
    createUserSession(email: $email, password: $password) {
      id
      user {
        email
        id
      }
    }
  }
`;

const Login = ({ onChangeToSignUp: pushChangeToSignUp }) => {
  const dispatch = useDispatch();
  const [createUserSession] = useMutation(mutation);
  const {
    formState: { isSumbitting },
    handleSubmit,
    register,
  } = useForm();

  const onSubmit = handleSubmit(async ({ email, password }) => {
    const {
      data: { createUserSession: createdSession },
    } = await createUserSession({
      variables: {
        email,
        password,
      },
    });
    dispatch(setSession(createdSession));
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
      </Lable>
      <LoginButton disable={isSumbitting} type="submit">
        Login
      </LoginButton>{" "}
      <OrSignUp>
        or{' '}
        <a
          href="#"
          onClick={evt => {
            evt.preventDefault();
            pushChangeToSignUp();
          }}
        >
          Sign Up
        </a>
      </OrSignUp>
    </form>
  );
};

export default Login;
