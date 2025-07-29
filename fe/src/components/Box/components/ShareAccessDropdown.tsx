import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Avatar, Checkbox, DropdownMenu, Flex, Text } from "@radix-ui/themes";
import { useState } from "react";
import { IoMdKey } from "react-icons/io";
import { Button } from "../../ui/Button";

type ShareAccessOption = {
  id: string;
  name: string;
  avatar?: string;
};

type ShareAccessDropdownProps = {
  options: ShareAccessOption[];
  value: string[];
  onChange: (selectedIds: string[]) => void;
  disabled?: boolean;
  shortText?: boolean;
};

const getDisplayText = (selectedCount: number, totalCount: number): string => {
  if (selectedCount === 0) {
    return "Sharing with none";
  }
  if (selectedCount === totalCount) {
    return "Sharing with all";
  }
  return "Sharing with selected";
};

export const ShareAccessDropdown = ({
  options,
  value,
  onChange,
  disabled: propDisabled = false,
  shortText,
}: ShareAccessDropdownProps) => {
  const [open, setOpen] = useState(false);

  const handleToggleOption = (optionId: string) => {
    const isSelected = value.includes(optionId);
    if (isSelected) {
      onChange(value.filter((id) => id !== optionId));
    } else {
      onChange([...value, optionId]);
    }
  };

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((option) => option.id));
    }
  };

  const displayText = getDisplayText(value.length, options.length);
  const allSelected = value.length === options.length;
  const someSelected = value.length > 0 && value.length < options.length;

  const disabled = propDisabled || options.length === 0;

  return (
    <DropdownMenu.Root
      open={open}
      onOpenChange={disabled ? undefined : setOpen}
    >
      <DropdownMenu.Trigger disabled={disabled}>
        <Button
          variant={value.length > 0 ? "primary" : "secondary"}
          iconSlot={<IoMdKey />}
          iconSlotEnd={<ChevronDownIcon />}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Share access options"
        >
          {shortText ? displayText.split(" ")[0] : displayText}
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        align="end"
        sideOffset={8}
        className="w-64 max-h-80 overflow-y-auto"
        aria-label="Share access menu"
        variant="soft"
        role="menu"
      >
        <DropdownMenu.Item
          onSelect={(e) => {
            e.preventDefault();
            handleSelectAll();
          }}
          className="cursor-pointer"
        >
          <Flex align="center" gap="2" width="100%">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              aria-label="Select all options"
              {...(someSelected && { "data-indeterminate": true })}
            />
            <Text size="2" weight="medium">
              Select All
            </Text>
          </Flex>
        </DropdownMenu.Item>

        <DropdownMenu.Separator />

        {options.map((option) => {
          const isSelected = value.includes(option.id);

          return (
            <DropdownMenu.Item
              key={option.id}
              onSelect={(e) => {
                e.preventDefault();
                handleToggleOption(option.id);
              }}
              className="cursor-pointer"
            >
              <Flex align="center" gap="2" width="100%">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleToggleOption(option.id)}
                  aria-label={`${isSelected ? "Unselect" : "Select"} ${option.name}`}
                />

                <Flex align="center" gap="2" flexGrow="1">
                  {option.avatar ? (
                    <Avatar
                      src={option.avatar}
                      fallback={option.name.charAt(0).toUpperCase()}
                      size="1"
                      radius="full"
                    />
                  ) : (
                    <Avatar
                      fallback={option.name.charAt(0).toUpperCase()}
                      size="1"
                      radius="full"
                    />
                  )}

                  <Flex direction="column" gap="1">
                    <Text size="2" weight="medium">
                      {option.name}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </DropdownMenu.Item>
          );
        })}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
