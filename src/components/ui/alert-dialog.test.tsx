/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./alert-dialog"

describe("AlertDialog", () => {
  it("renders trigger and opens/closes dialog", async () => {
    const user = userEvent.setup()

    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )

    // dialog is not in DOM initially
    expect(
      screen.queryByText(/are you sure\?/i)
    ).not.toBeInTheDocument()

    // click trigger
    await user.click(screen.getByRole("button", { name: /open/i }))

    // dialog content appears
    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
    expect(screen.getByText(/this action cannot be undone/i)).toBeVisible()

    // click cancel -> dialog should close
    await user.click(screen.getByRole("button", { name: /cancel/i }))
    expect(
      screen.queryByRole("alertdialog")
    ).not.toBeInTheDocument()
  })

  it("calls action when confirmed", async () => {
    const user = userEvent.setup()
    const onAction = jest.fn()

    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {/* Wrap Action in a button with handler */}
            <AlertDialogAction onClick={onAction}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )

    await user.click(screen.getByText(/open/i))
    await user.click(screen.getByText(/yes/i))

    expect(onAction).toHaveBeenCalled()
  })
})
