import React from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import * as yup from 'yup';
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

const SignUpButton = styled.button`
  display: inline-block;
  margin-top: 0.5rem;
`;

const OrLogin = styled.span`
  font-size: 0.9rem;
`;

const mutation = gql`
  mutation($email: String!, $password: String!) {
    createUser(email: $email, password: $password) {
      id
    }
  }
`;

const validationSchema = yup.object().shape({
  email: yup.string().required(),
  password: yup
    .string()
    .required()
    .test('sameAsConfirmPassword', '${path} is not the same as the confirmation password', function() {
      return this.parent.password === this.parent.confirmPassword;
    }),
});

const SignUp = ({ onChangeToLogin: pushChangeToLogin }) => {
  const [createUser] = useMutation(mutation);
  const {
    formState: { isSubmitting, isValid },
    handleSubmit,
    register,
    reset,
  } = useForm({ mode: 'onChange', validationSchema });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    await createUser({ variables: { email, password } });
    reset();
    pushChangeToLogin();
  });

  return (
    <form onSubmit={onSubmit}>
      <Lable>
        <LableText>Email</LableText>
        <TextInput disable={isSubmitting} name="email" type="email" ref={register} />
      </Lable>
      <Lable>
        <LableText>Password</LableText>
        <TextInput disable={isSubmitting} name="password" type="password" ref={register} />
      </Lable>
      <Lable>
        <LableText> Confirm Password</LableText>
        <TextInput disable={isSubmitting} name="confirmPassword" type="password" ref={register} />
      </Lable>
      <SignUpButton disabled={isSubmitting || !isValid} type="submit">
        Sign Up
      </SignUpButton>{' '}
      <OrLogin>
        or{' '}
        <a
          href="#"
          onClick={evt => {
            evt.preventDefault();
            pushChangeToLogin();
          }}
        >
          Login
        </a>
      </OrLogin>
    </form>
  );
};

export default SignUp;
