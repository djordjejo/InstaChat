namespace Application.Common.Exceptions
{
    public class NotFoundException : Exception
    {
        public NotFoundException(string message) : base(message) { }
    }

    public class ForbiddenException : Exception
    {
        public ForbiddenException(string message) : base(message) { }
    }

    public class ConflictException : Exception
    {
        public ConflictException(string message) : base(message) { }
    }

    public class InvalidCredentialsException : Exception
    {
        public InvalidCredentialsException(string message) : base(message) { }
    }

    // Nosi mapu "ime polja -> lista poruka", jer jedno polje moze imati vise
    // prekrsenih pravila. Namerno NE koristimo FluentValidation.ValidationException:
    // Application sloj tako ne izvozi tip iz te biblioteke ka API sloju.
    public class ValidationException : Exception
    {
        public IReadOnlyDictionary<string, string[]> Errors { get; }

        public ValidationException(IReadOnlyDictionary<string, string[]> errors)
            : base("Uneti podaci nisu ispravni.")
        {
            Errors = errors;
        }
    }
}
