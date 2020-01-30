import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';

import Textarea from '#root/components/shared/Textarea';
import TextInput from '#root/components/shared/TextInput';

const Form = styled.form`
  background-color: ${props => props.theme.whiteSmoke};
  margin-top: 1rem;
  padding: 1rem;
`;

const Label = styled.label`
  display: block;
  :not(:first-child) {
    margin-top: 0.5rem;
  }
`;

const LabelText = styled.strong`
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const Button = styled.button`
  display: inline-block;
  margin-top: 0.5rem;
`;

const mutation = gql`
  mutation($description: String!, $title: String!) {
    createListing(description: $description, title: $title) {
      id
    }
  }
`;

const AddListing = ({ onAddLinting: pushAddLinting }) => {
  const [createListing] = useMutation(mutation);
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm();

  const session = useSelector(state => state.session);

  if (!session) return <p>Login to add listing.</p>;

  const onSubmit = handleSubmit(async ({ title, description }) => {
    await createListing({ variables: { title, description } });
    reset();
    pushAddLinting();
  });

  return (
    <Form onSubmit={onSubmit}>
      <Label>
        <LabelText>Title</LabelText>
        <TextInput disable={isSubmitting} name="title" ref={register} type="text" />
      </Label>
      <Label>
        <LabelText>Descritption</LabelText>
        <Textarea disable={isSubmitting} name="description" ref={register} />
      </Label>
      <Button disable={isSubmitting} type="submit">
        Add listing
      </Button>
    </Form>
  );
};

export default AddListing;
