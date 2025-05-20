import {
  createContext,
  createUniqueId,
  useContext,
  type ParentComponent,
} from "solid-js"

export interface FormFieldContext {
  id: string
}
export const FormFieldContext = createContext<FormFieldContext>()

export const FormFieldContextProvider: ParentComponent = (p) => (
  <FormFieldContext.Provider value={{ id: createUniqueId() }}>
    {p.children}
  </FormFieldContext.Provider>
)

export const useFormFieldContext = () => useContext(FormFieldContext)
