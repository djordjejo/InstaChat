using FluentValidation;

namespace Application.Messages.Command
{
    public class SendMessageCommandValidator : AbstractValidator<SendMessageCommand>
    {
        public SendMessageCommandValidator()
        {
            // NotEmpty nad Guid-om proverava != Guid.Empty.
            RuleFor(x => x.ConversationId)
                .NotEmpty().WithMessage("Razgovor nije naveden.");

            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("Poruka ne može biti prazna.")
                // Poklapa se sa HasMaxLength(2000) na Message.Content. Ranije je
                // duza poruka prolazila do baze i vracala SqlException kao 500.
                .MaximumLength(2000).WithMessage("Poruka može imati najviše 2000 karaktera.");
        }
    }
}
