'use client'

import {
  Autocomplete,
  Button,
  Checkbox,
  CheckboxGroup,
  Combobox,
  Field,
  FileField,
  NumberField,
  OTPField,
  RadioGroup,
  SegmentedControl,
  Select,
  Slider,
  Switch,
  TagsField,
  TextArea,
  TextField,
} from 'basedkit'
import { DateField } from 'basedkit/date-field'
import { PhoneField } from 'basedkit/phone-field'
import { type ReactNode, useState } from 'react'
import { Controller, type Path, useForm } from 'react-hook-form'

type Fruit = {
  label: string
  value: string
}

type Values = {
  agree: boolean
  bio: string
  city: string
  code: string
  date: Date | null
  files: Array<File>
  fruit: Fruit | null
  fruits: Array<string>
  name: string
  notify: boolean
  phone: string
  plan: string
  quantity: number | null
  resume: Array<File>
  size: string
  tags: Array<string>
  view: string
  volume: number
}

const fruits: Array<Fruit> = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
]

const sizes = {
  large: 'Large',
  medium: 'Medium',
  small: 'Small',
}

const cities = ['Berlin', 'Dubai', 'Karachi', 'Lisbon', 'Tokyo']

const required = 'This field is required'

// files print as their names
function names(value: unknown) {
  return value instanceof File ? value.name : value
}

// every form component in one react-hook-form form. a field without a default
// is required, so submitting the form empty focuses the first one; the button
// beside a field focuses that one, as react-hook-form does after a failed
// submit. SegmentedControl and Slider start with a value and can't fail
export function ReactHookForm() {
  const [submitted, setSubmitted] = useState<string>()

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setFocus,
  } = useForm<Values>({
    defaultValues: {
      agree: false,
      bio: '',
      city: '',
      code: '',
      date: null,
      files: [],
      fruit: null,
      fruits: [],
      name: '',
      notify: false,
      phone: '',
      plan: '',
      quantity: null,
      resume: [],
      size: '',
      tags: [],
      view: 'list',
      volume: 50,
    },
  })

  const row = (
    name: Path<Values>,
    label: string,
    children: ReactNode,
    focusable = true,
  ) => (
    <div className="flex items-start gap-4" data-field={name}>
      <Field
        className="min-w-0 flex-1"
        error={errors[name as keyof Values]?.message}
        label={label}
      >
        {children}
      </Field>

      {focusable ? (
        <Button
          className="mt-6"
          data-focus={name}
          onClick={() => {
            setFocus(name)
          }}
          type="button"
          variant="soft"
        >
          Focus
        </Button>
      ) : null}
    </div>
  )

  return (
    <form
      className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6"
      noValidate
      onSubmit={handleSubmit((values) => {
        setSubmitted(JSON.stringify(values, (_, value) => names(value), 2))
      })}
    >
      <h1 className="text-2xl font-bold">React Hook Form</h1>

      {row(
        'name',
        'TextField (register)',
        <TextField.Root {...register('name', { required })} />,
      )}

      {row(
        'bio',
        'TextArea (register)',
        <TextArea.Root {...register('bio', { required })} />,
      )}

      {row(
        'quantity',
        'NumberField',
        <Controller
          control={control}
          name="quantity"
          render={({ field }) => (
            <NumberField
              onBlur={field.onBlur}
              onValueChange={field.onChange}
              ref={field.ref}
              value={field.value}
            />
          )}
          rules={{ required }}
        />,
      )}

      {row(
        'code',
        'OTPField',
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <OTPField
              length={6}
              onValueChange={field.onChange}
              ref={field.ref}
              value={field.value}
            />
          )}
          rules={{ required }}
        />,
      )}

      {row(
        'phone',
        'PhoneField',
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <PhoneField
              onBlur={field.onBlur}
              onValueChange={field.onChange}
              ref={field.ref}
              value={field.value}
            />
          )}
          rules={{ required }}
        />,
      )}

      {row(
        'resume',
        'FileField (focus opens the picker)',
        <Controller
          control={control}
          name="resume"
          render={({ field }) => (
            <FileField
              accept="application/pdf"
              onBlur={field.onBlur}
              onValueChange={field.onChange}
              placeholder="Drop a PDF here or click to browse"
              ref={field.ref}
              value={field.value}
            />
          )}
          rules={{
            validate: (value) => value.length > 0 || required,
          }}
        />,
      )}

      {row(
        'files',
        'FileField (multiple)',
        <Controller
          control={control}
          name="files"
          render={({ field }) => (
            <FileField
              layout="zone"
              multiple
              onBlur={field.onBlur}
              onValueChange={field.onChange}
              ref={field.ref}
              value={field.value}
            />
          )}
          rules={{
            validate: (value) => value.length > 0 || required,
          }}
        />,
      )}

      {row(
        'tags',
        'TagsField',
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <TagsField
              onBlur={field.onBlur}
              onValueChange={field.onChange}
              placeholder="Add a tag"
              ref={field.ref}
              value={field.value}
            />
          )}
          rules={{
            validate: (value) => value.length > 0 || required,
          }}
        />,
      )}

      {row(
        'date',
        'DateField',
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DateField
              onValueChange={field.onChange}
              placeholder="Pick a date"
              ref={field.ref}
              value={field.value}
            />
          )}
          rules={{ required }}
        />,
      )}

      {row(
        'size',
        'Select (inputRef on Select.Root)',
        <Controller
          control={control}
          name="size"
          render={({ field }) => (
            <Select.Root
              inputRef={field.ref}
              items={sizes}
              onValueChange={field.onChange}
              value={field.value}
            >
              <Select.Trigger placeholder="Pick a size" />

              <Select.Content>
                {Object.entries(sizes).map(([value, label]) => (
                  <Select.Item key={value} value={value}>
                    {label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          )}
          rules={{ required }}
        />,
      )}

      {row(
        'fruit',
        'Combobox',
        <Controller
          control={control}
          name="fruit"
          render={({ field }) => (
            <Combobox.Root
              items={fruits}
              onValueChange={field.onChange}
              value={field.value}
            >
              <Combobox.Input placeholder="Pick a fruit" ref={field.ref} />

              <Combobox.Content empty="No fruits found" />
            </Combobox.Root>
          )}
          rules={{ required }}
        />,
      )}

      {row(
        'city',
        'Autocomplete',
        <Controller
          control={control}
          name="city"
          render={({ field }) => (
            <Autocomplete.Root
              items={cities}
              onValueChange={field.onChange}
              value={field.value}
            >
              <Autocomplete.Input placeholder="Search cities" ref={field.ref} />

              <Autocomplete.Content empty="No cities found" />
            </Autocomplete.Root>
          )}
          rules={{ required }}
        />,
      )}

      {row(
        'agree',
        'Checkbox',
        <Controller
          control={control}
          name="agree"
          render={({ field }) => (
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              ref={field.ref}
            />
          )}
          rules={{ required }}
        />,
      )}

      {row(
        'notify',
        'Switch',
        <Controller
          control={control}
          name="notify"
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              ref={field.ref}
            />
          )}
          rules={{ required }}
        />,
      )}

      {row(
        'fruits',
        'CheckboxGroup (ref on the first item)',
        <Controller
          control={control}
          name="fruits"
          render={({ field }) => (
            <CheckboxGroup.Root
              onValueChange={field.onChange}
              value={field.value}
            >
              {fruits.map((fruit, index) => (
                <CheckboxGroup.Item
                  key={fruit.value}
                  // a group has no control of its own: the first box takes
                  // the focus
                  ref={index === 0 ? field.ref : undefined}
                  value={fruit.value}
                >
                  {fruit.label}
                </CheckboxGroup.Item>
              ))}
            </CheckboxGroup.Root>
          )}
          rules={{
            validate: (value) => value.length > 0 || required,
          }}
        />,
      )}

      {row(
        'plan',
        'RadioGroup (inputRef on RadioGroup.Root)',
        <Controller
          control={control}
          name="plan"
          render={({ field }) => (
            <RadioGroup.Root
              inputRef={field.ref}
              onValueChange={field.onChange}
              value={field.value}
            >
              <RadioGroup.Item value="free">Free</RadioGroup.Item>
              <RadioGroup.Item value="pro">Pro</RadioGroup.Item>
              <RadioGroup.Item value="team">Team</RadioGroup.Item>
            </RadioGroup.Root>
          )}
          rules={{ required }}
        />,
      )}

      {row(
        'view',
        'SegmentedControl',
        <Controller
          control={control}
          name="view"
          render={({ field }) => (
            <SegmentedControl.Root
              onValueChange={field.onChange}
              value={field.value}
            >
              <SegmentedControl.Item value="list">List</SegmentedControl.Item>
              <SegmentedControl.Item value="board">Board</SegmentedControl.Item>
              <SegmentedControl.Item value="table">Table</SegmentedControl.Item>
            </SegmentedControl.Root>
          )}
        />,
        false,
      )}

      {row(
        'volume',
        'Slider',
        <Controller
          control={control}
          name="volume"
          render={({ field }) => (
            <Slider onValueChange={field.onChange} value={field.value} />
          )}
        />,
        false,
      )}

      <div className="flex gap-4">
        <Button type="submit">Submit</Button>

        <Button
          onClick={() => {
            reset()
            setSubmitted(undefined)
          }}
          type="button"
          variant="soft"
        >
          Reset
        </Button>
      </div>

      {submitted ? (
        <pre className="overflow-auto text-sm" data-submitted>
          {submitted}
        </pre>
      ) : null}
    </form>
  )
}
